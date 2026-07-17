export async function onRequest(context) {
    const url = new URL(context.request.url);

    if (url.hostname === 'job-tracker.io') {
        url.hostname = 'www.job-tracker.io';
        return Response.redirect(url.toString(), 301);
    }

    return context.next();
}
