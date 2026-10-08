import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ModernNewApplicationPopup from './ModernNewApplicationPopup';

jest.mock('react-router-dom', () => ({
    useLocation: () => ({ search: '', pathname: '/tracker' }),
}));

const existingJobs = [
    { companyName: 'Acme', list: 'Spring 2026', position: 'Old role' },
    { companyName: 'Initech', list: 'Other', position: 'Analyst' },
];

const linkedInHtml = `
<html><head><title>Acme hiring Software Engineer in Austin, TX | LinkedIn</title></head>
<body>JobPosting top-card placeholder so the proxy response is long enough to be accepted.</body></html>
`;

function renderPopup(overrides = {}) {
    const props = {
        text: 'NewApplication',
        closePopup: jest.fn(),
        listNames: ['Spring 2026', 'Other'],
        onApplicationCreated: jest.fn(),
        existingJobs,
        ...overrides,
    };

    render(<ModernNewApplicationPopup {...props} />);

    return props;
}

async function fillRequiredFields({
    company = 'Acme',
    position = 'Engineer',
    location = 'Remote',
    link = 'https://example.com/jobs/1',
    list = 'Spring 2026',
} = {}) {
    await userEvent.type(screen.getByPlaceholderText('Enter company name...'), company);
    await userEvent.type(screen.getByPlaceholderText('Enter position...'), position);
    await userEvent.type(screen.getByPlaceholderText('Remote, United States, or City, XX...'), location);
    await userEvent.type(screen.getByPlaceholderText('Enter job link...'), link);
    await userEvent.selectOptions(screen.getByRole('combobox'), list);
}

describe('ModernNewApplicationPopup duplicate company notice', () => {
    beforeEach(() => {
        localStorage.setItem('username', 'tester');
        global.fetch = jest.fn();
    });

    afterEach(() => {
        localStorage.clear();
        jest.resetAllMocks();
    });

    test('shows a notice as soon as the typed company name exactly matches an existing application', async () => {
        renderPopup();

        expect(screen.queryByRole('status')).not.toBeInTheDocument();

        await userEvent.type(screen.getByPlaceholderText('Enter company name...'), 'Acm');
        expect(screen.queryByRole('status')).not.toBeInTheDocument();

        await userEvent.type(screen.getByPlaceholderText('Enter company name...'), 'e');
        expect(screen.getByRole('status')).toHaveTextContent(
            'An application for "Acme" in "Spring 2026" already exists. Clicking Add Application will delete that application and save only this new one.'
        );

        await userEvent.clear(screen.getByPlaceholderText('Enter company name...'));
        await userEvent.type(screen.getByPlaceholderText('Enter company name...'), 'acme');
        expect(screen.getByRole('status')).toHaveTextContent(
            'An application for "Acme" in "Spring 2026" already exists.'
        );

        await userEvent.clear(screen.getByPlaceholderText('Enter company name...'));
        await userEvent.type(screen.getByPlaceholderText('Enter company name...'), 'Initech');
        expect(screen.getByRole('status')).toHaveTextContent('An application for "Initech" in "Other" already exists.');
    });

    test('shows the notice after a LinkedIn import fills a company that already exists', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            status: 200,
            text: async () => linkedInHtml,
        });

        renderPopup();
        await userEvent.selectOptions(screen.getByRole('combobox'), 'Other');
        await userEvent.click(screen.getByRole('button', { name: 'Import LinkedIn Job Listing' }));
        await userEvent.type(
            screen.getByPlaceholderText('https://www.linkedin.com/jobs/view/...'),
            'https://www.linkedin.com/jobs/view/1234567890'
        );
        await userEvent.click(screen.getByRole('button', { name: 'Import' }));

        expect(await screen.findByRole('status')).toHaveTextContent(
            'An application for "Acme" in "Spring 2026" already exists.'
        );
        expect(screen.getByPlaceholderText('Enter company name...')).toHaveValue('Acme');
        expect(screen.getByRole('button', { name: 'Add Application' })).toBeEnabled();
    });

    test('retries an unavailable LinkedIn import and shows the attempt count', async () => {
        let calls = 0;
        const pending = [];
        global.fetch.mockImplementation(() => {
            calls += 1;
            const attempt = calls;
            return new Promise((resolve) => {
                pending.push(() => resolve(
                    attempt < 3
                        ? {
                            ok: false,
                            status: 503,
                            text: async () => JSON.stringify({ error: 'LinkedIn fetch failed' }),
                        }
                        : {
                            ok: true,
                            status: 200,
                            text: async () => linkedInHtml,
                        }
                ));
            });
        });

        renderPopup();
        await userEvent.click(screen.getByRole('button', { name: 'Import LinkedIn Job Listing' }));
        await userEvent.type(
            screen.getByPlaceholderText('https://www.linkedin.com/jobs/view/...'),
            'https://www.linkedin.com/jobs/view/1234567890'
        );
        await userEvent.click(screen.getByRole('button', { name: 'Import' }));

        expect(await screen.findByRole('button', { name: 'Importing... 1' })).toBeDisabled();
        pending[0]();
        expect(await screen.findByRole('button', { name: 'Importing... 2' }, { timeout: 3000 })).toBeDisabled();
        pending[1]();
        expect(await screen.findByRole('button', { name: 'Importing... 3' }, { timeout: 3000 })).toBeDisabled();
        pending[2]();

        expect(await screen.findByPlaceholderText('Enter company name...')).toHaveValue('Acme');
        expect(calls).toBe(3);
    });

    test('deletes the existing application and then saves only the new one', async () => {
        const calls = [];
        global.fetch.mockImplementation(async (url, options = {}) => {
            calls.push({ url: String(url), options });
            return { ok: true, json: async () => ({}) };
        });

        const props = renderPopup();
        await fillRequiredFields();
        await userEvent.click(screen.getByRole('button', { name: 'Add Application' }));

        await waitFor(() => expect(calls).toHaveLength(2));
        expect(calls[0].url).toContain('/Jobs/deleteJob');
        expect(calls[0].url).toContain('companyName=Acme');
        expect(calls[0].options.method).toBe('DELETE');
        expect(calls[1].url).toContain('/Jobs/create');
        expect(calls[1].options.method).toBe('POST');
        expect(JSON.parse(calls[1].options.body).companyName).toBe('Acme');
        expect(JSON.parse(calls[1].options.body).position).toBe('Engineer');

        await waitFor(() => expect(props.onApplicationCreated).toHaveBeenCalled(), { timeout: 2000 });
        expect(props.onApplicationCreated.mock.calls[0][1]).toEqual({ replacedCompanyName: 'Acme' });
    });

    test('matches an existing company even when the capitalization differs', async () => {
        const calls = [];
        global.fetch.mockImplementation(async (url, options = {}) => {
            calls.push({ url: String(url), options });
            return { ok: true, json: async () => ({}) };
        });

        renderPopup();
        await fillRequiredFields({ company: 'acme' });
        expect(screen.getByRole('status')).toHaveTextContent('An application for "Acme"');
        await userEvent.click(screen.getByRole('button', { name: 'Add Application' }));

        await waitFor(() => expect(calls).toHaveLength(2));
        expect(calls[0].url).toContain('companyName=Acme');
        expect(calls[0].options.method).toBe('DELETE');
        expect(JSON.parse(calls[1].options.body).companyName).toBe('acme');
    });

    test('does not save a new application when removing the existing one fails', async () => {
        global.fetch.mockResolvedValue({
            ok: false,
            status: 500,
            json: async () => ({}),
        });

        renderPopup();
        await fillRequiredFields();
        await userEvent.click(screen.getByRole('button', { name: 'Add Application' }));

        expect(await screen.findByText(/Failed to remove the existing application/)).toBeInTheDocument();
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(String(global.fetch.mock.calls[0][0])).toContain('/Jobs/deleteJob');
    });

    test('only creates an application when the company name is new', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({}),
        });

        const props = renderPopup();
        await fillRequiredFields({ company: 'Brand New Co' });
        await userEvent.click(screen.getByRole('button', { name: 'Add Application' }));

        await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
        expect(String(global.fetch.mock.calls[0][0])).toContain('/Jobs/create');
        expect(String(global.fetch.mock.calls[0][0])).not.toContain('/Jobs/deleteJob');
        await waitFor(() => expect(props.onApplicationCreated).toHaveBeenCalled(), { timeout: 2000 });
        expect(props.onApplicationCreated.mock.calls[0][1]).toEqual({ replacedCompanyName: undefined });
    });
});
