import React, { useEffect, useState } from 'react';
import NavBar from '../components/navBar';
import ModernFooter from '../components/ModernFooter';

function SettingsPage() {
	const [activeTab, setActiveTab] = useState('account');
	const [position, setPosition] = useState(localStorage.getItem('profilePosition') || '');
	const [location, setLocation] = useState(localStorage.getItem('profileLocation') || '');
	const [initialPosition, setInitialPosition] = useState(localStorage.getItem('profilePosition') || '');
	const [initialLocation, setInitialLocation] = useState(localStorage.getItem('profileLocation') || '');
	const [saveMessage, setSaveMessage] = useState('');
	const [appearanceMode, setAppearanceMode] = useState('default');
	const [placeholderFields, setPlaceholderFields] = useState({
		placeholder1: '',
		placeholder2: '',
		placeholder3: '',
		placeholder4: '',
		placeholder5: '',
		placeholder6: '',
		placeholder7: ''
	});
	const hasAccountChanges = position !== initialPosition || location !== initialLocation;
	const accountSettingsCount = 10;
	const appearanceSettingsCount = 1;
	const activeSettingsCount = activeTab === 'account' ? accountSettingsCount : appearanceSettingsCount;

	useEffect(() => {
		const fetchUserSettings = async () => {
			try {
				const stage = 'https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev';
				const url = `${stage}/Users/getByUsername?username=${localStorage.getItem('username')}`;
				const encode = window.btoa('admin:admin');

				const res = await fetch(url, {
					headers: { Authorization: 'Basic ' + encode },
					method: 'GET'
				});

				if (!res.ok) {
					return;
				}

				const userData = await res.json();

				const backendPosition =
					userData?.position ||
					(typeof userData?.careerTitle === 'string'
						? userData.careerTitle.replace(/[{}"]/g, '').split(',')[0]?.trim()
						: '');
				const backendLocation = userData?.location || '';
				const resolvedPosition = backendPosition || localStorage.getItem('profilePosition') || '';
				const resolvedLocation = backendLocation || localStorage.getItem('profileLocation') || '';

				setPosition(resolvedPosition);
				setLocation(resolvedLocation);
				setInitialPosition(resolvedPosition);
				setInitialLocation(resolvedLocation);
			} catch (err) {
				console.error('Failed to load settings user data:', err);
			}
		};

		fetchUserSettings();
	}, []);

	const handleSaveAccount = () => {
		if (!hasAccountChanges) return;

		localStorage.setItem('profilePosition', position);
		localStorage.setItem('profileLocation', location);
		setInitialPosition(position);
		setInitialLocation(location);
		setSaveMessage('Account settings saved.');

		setTimeout(() => {
			setSaveMessage('');
		}, 2000);
	};

	const tabButtonStyle = (tabName) => ({
		padding: '10px 16px',
		borderRadius: '8px',
		border: '1px solid #3a3a3c',
		backgroundColor: activeTab === tabName ? '#2f6db3' : 'rgba(255, 255, 255, 0.4)',
		color: '#000000',
		fontSize: '14px',
		fontWeight: '600',
		cursor: 'pointer'
	});

	const inputStyle = {
		width: '100%',
		padding: '12px 14px',
		borderRadius: '8px',
		border: '1px solid #3a3a3c',
		backgroundColor: '#2c2c2e',
		color: '#f0f0f0',
		fontSize: '14px',
		boxSizing: 'border-box'
	};

	return (
		<>
			<NavBar />

			<div className='modernTrackerPageBackground'>
				<div style={{
					width: '100%',
					minHeight: '720px',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					padding: '30px 20px'
				}}>
					<div style={{
						backgroundColor: 'rgba(255, 255, 255, 0.4)',
						borderRadius: '16px',
						padding: '36px 32px 28px',
						width: '760px',
						height: '560px',
						maxHeight: '85vh',
						maxWidth: '95vw',
						display: 'flex',
						flexDirection: 'column',
						color: '#f0f0f0',
						fontFamily: 'system-ui, -apple-system, sans-serif',
                        border: '0.1px solid black',
					}}>
						<h2 style={{ margin: '0 0 8px', fontSize: '28px', fontWeight: '700', color: '#000000' }}>
							Settings
						</h2>
						<p style={{ margin: '0 0 20px', fontSize: '14px', color: '#333333' }}>
							Manage your account details and future appearance preferences.
						</p>

						<hr style={{ border: 'none', borderTop: '1px solid #333', margin: '0 0 18px' }} />

						<div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
							<button style={tabButtonStyle('account')} onClick={() => setActiveTab('account')}>
								Account
							</button>
							<button style={tabButtonStyle('appearance')} onClick={() => setActiveTab('appearance')}>
								Appearance
							</button>
						</div>

						<div style={{
							border: '1px solid #3a3a3c',
							borderRadius: '12px',
							backgroundColor: 'rgba(255, 255, 255, 0.4)',
							padding: '18px',
							flex: 1,
							minHeight: 0,
							overflow: 'hidden'
						}}>
							{activeTab === 'account' ? (
								<div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%', minHeight: 0 }}>
									<div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, minHeight: 0, overflowY: activeSettingsCount > 3 ? 'auto' : 'hidden', paddingRight: '4px' }}>
										<h3 style={{ margin: 0, fontSize: '18px', color: '#000000' }}>Account Settings</h3>

										<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
											<label style={{ fontSize: '14px', fontWeight: '600', color: 'black'  }}>Username</label>
											<input
												value={localStorage.getItem('username') || ''}
												readOnly
												style={{
													...inputStyle,
													color: '#888',
												}}
											/>
										</div>

										<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
											<label style={{ fontSize: '14px', fontWeight: '600', color: 'black' }}>Position</label>
											<input
												value={position}
												onChange={(e) => setPosition(e.target.value)}
												placeholder='Enter your role or target position'
												style={inputStyle}
											/>
										</div>

										<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
											<label style={{ fontSize: '14px', fontWeight: '600', color: 'black' }}>Location</label>
											<input
												value={location}
												onChange={(e) => setLocation(e.target.value)}
												placeholder='Enter city, state or Remote'
												style={inputStyle}
											/>
										</div>

										{Object.entries(placeholderFields).map(([fieldKey, fieldValue], index) => (
											<div key={fieldKey} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
												<label style={{ fontSize: '14px', fontWeight: '600', color: 'black' }}>
													Placeholder Field {index + 1}
												</label>
												<input
													value={fieldValue}
													onChange={(e) => setPlaceholderFields((prev) => ({ ...prev, [fieldKey]: e.target.value }))}
													placeholder={`Placeholder input ${index + 1}`}
													style={inputStyle}
												/>
											</div>
										))}
									</div>

									<div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', borderTop: '1px solid #333', paddingTop: '12px' }}>
										{saveMessage !== '' ? (
											<span style={{
												fontSize: '12px',
												color: '#8fd1a0',
												backgroundColor: 'rgba(0, 153, 72, 0.18)',
												border: '1px solid rgba(0, 153, 72, 0.45)',
												padding: '6px 10px',
												borderRadius: '8px'
											}}>
												{saveMessage}
											</span>
										) : null}
										<button
											onClick={handleSaveAccount}
											disabled={!hasAccountChanges}
											style={{
												padding: '10px 20px',
												borderRadius: '8px',
												border: 'none',
												backgroundColor: hasAccountChanges ? '#4a9eff' : '#3a5080',
												color: hasAccountChanges ? '#ffffff' : '#7a9aaa',
												fontSize: '14px',
												fontWeight: '600',
												cursor: hasAccountChanges ? 'pointer' : 'not-allowed'
											}}
										>
											Save Account
										</button>
									</div>
								</div>
							) : (
								<div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%', minHeight: 0 }}>
									<div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, minHeight: 0, overflowY: activeSettingsCount > 3 ? 'auto' : 'hidden', paddingRight: '4px' }}>
										<h3 style={{ margin: 0, fontSize: '18px', color: '#000000' }}>Appearance</h3>

										<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
											<label style={{ fontSize: '14px', fontWeight: '600', color: 'black'  }}>Color Scheme</label>
											<select
												value={appearanceMode}
												onChange={(e) => setAppearanceMode(e.target.value)}
												style={inputStyle}
											>
												<option value='default'>Default (Current)</option>
												<option value='forest'>Forest</option>
												<option value='ocean'>Ocean</option>
												<option value='sunset'>Sunset</option>
											</select>
										</div>
									</div>

									<div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #333', paddingTop: '12px' }}>
										<button
											disabled
											style={{
												padding: '10px 20px',
												borderRadius: '8px',
												border: 'none',
												backgroundColor: '#3a5080',
												color: '#7a9aaa',
												fontSize: '14px',
												fontWeight: '600',
												cursor: 'not-allowed'
											}}
										>
											Save Appearance (Coming Soon)
										</button>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			<ModernFooter />
		</>
	);
}

export default SettingsPage;
