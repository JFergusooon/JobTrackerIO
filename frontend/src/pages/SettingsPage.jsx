import React, { useEffect, useState } from 'react';
import NavBar from '../components/navBar';
import ModernFooter from '../components/ModernFooter';

function SettingsPage() {
	const [activeTab, setActiveTab] = useState('account');
	const [careerTitle, setCareerTitle] = useState(localStorage.getItem('profilePosition') || '');
	const [location, setLocation] = useState(localStorage.getItem('profileLocation') || '');
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [initialCareerTitle, setInitialCareerTitle] = useState(localStorage.getItem('profilePosition') || '');
	const [initialLocation, setInitialLocation] = useState(localStorage.getItem('profileLocation') || '');
	const [initialFirstName, setInitialFirstName] = useState('');
	const [initialLastName, setInitialLastName] = useState('');
	const [saveMessage, setSaveMessage] = useState('');
	const [appearanceMode, setAppearanceMode] = useState(localStorage.getItem('curAppearanceScheme') || 'Forest');
	const [initialAppearanceMode, setInitialAppearanceMode] = useState(localStorage.getItem('curAppearanceScheme') || 'Forest');
	const [appearanceSaveMessage, setAppearanceSaveMessage] = useState('');
	const [isSavingAppearance, setIsSavingAppearance] = useState(false);
	const [careerTitleValidationError, setCareerTitleValidationError] = useState('');
	const [locationValidationError, setLocationValidationError] = useState('');
	const [firstNameValidationError, setFirstNameValidationError] = useState('');
	const [lastNameValidationError, setLastNameValidationError] = useState('');
	const [isSavingAccount, setIsSavingAccount] = useState(false);
	const [profilePictureFile, setProfilePictureFile] = useState(null);
	const [isUploadingProfilePicture, setIsUploadingProfilePicture] = useState(false);
	const [profilePictureUploadStatus, setProfilePictureUploadStatus] = useState('');
	const [profilePictureFileNameError, setProfilePictureFileNameError] = useState('');
	const [userAccountFields, setUserAccountFields] = useState({
		firstName: '',
		lastName: '',
		email: '',
		dateCreated: ''
	});

	const getPresignedUrl = async (file) => {
		const response = await fetch('https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev/generate-upload-url', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				fileName: file.name,
				fileType: file.type
			})
		});

		const data = await response.json();
		return data.uploadUrl;
	};

	const uploadProfilePictureToS3 = async (file) => {
		try {
			setIsUploadingProfilePicture(true);
			setProfilePictureUploadStatus('Uploading...');

			const uploadUrl = await getPresignedUrl(file);

			await fetch(uploadUrl, {
				method: 'PUT',
				headers: { 'Content-Type': file.type },
				body: file
			});

			setProfilePictureUploadStatus('Upload successful!');
			setIsUploadingProfilePicture(false);

			setTimeout(() => {
				setProfilePictureUploadStatus('');
			}, 2000);

			// After successful upload, update the user's profilePictureFileName
			const username = localStorage.getItem('username') || '';
			await updateProfilePictureFileName(username, file.name);
		} catch (err) {
			console.error('Failed to upload profile picture:', err);
			setProfilePictureUploadStatus('Upload failed. Please try again.');
			setIsUploadingProfilePicture(false);

			setTimeout(() => {
				setProfilePictureUploadStatus('');
			}, 2000);
		}
	};

	const handleProfilePictureUpload = () => {
		if (!profilePictureFile || profilePictureFileNameError) return;
		uploadProfilePictureToS3(profilePictureFile);
	};

	const handleProfilePictureFileSelect = (e) => {
		const file = e.target.files?.[0] || null;
		if (!file) {
			setProfilePictureFile(null);
			setProfilePictureFileNameError('');
			return;
		}

		const username = localStorage.getItem('username') || '';
		const expectedPrefix = `${username}_`;

		if (!file.name.startsWith(expectedPrefix)) {
			setProfilePictureFileNameError(`File must be named ${expectedPrefix}filename.png`);
			setProfilePictureFile(null);
		} else {
			setProfilePictureFile(file);
			setProfilePictureFileNameError('');
		}
	};

	const validateLocationFormat = (loc) => {
		if (!loc || loc.trim() === '') return true;
		const locationRegex = /^.+,\s*[A-Z]{2}$/;
		return locationRegex.test(loc);
	};

	const validateFirstNameFormat = (name) => {
		if (!name || name.trim() === '') return true;
		const firstNameRegex = /^[a-zA-Z]+$/;
		return firstNameRegex.test(name);
	};

	const validateLastNameFormat = (name) => {
		if (!name || name.trim() === '') return true;
		const lastNameRegex = /^[a-zA-Z]+$/;
		return lastNameRegex.test(name);
	};

	const validateCareerTitleFormat = (title) => {
		if (!title || title.trim() === '') return true;

		if (title !== title.trim()) {
			return false;
		}

		const allowedCharsRegex = /^[A-Za-z,\s]+$/;
		if (!allowedCharsRegex.test(title)) {
			return false;
		}

		const segments = title.split(',');
		if (segments.some((segment) => segment.trim() === '')) {
			return false;
		}

		const wordOnlyRegex = /^[A-Za-z]+(?:\s+[A-Za-z]+)*$/;
		return segments.every((segment) => wordOnlyRegex.test(segment.trim()));
	};

	const handleCareerTitleChange = (newCareerTitle) => {
		setCareerTitle(newCareerTitle);
		if (newCareerTitle.trim() === '') {
			setCareerTitleValidationError('');
		} else if (!validateCareerTitleFormat(newCareerTitle)) {
			setCareerTitleValidationError('Letters, spaces, and commas only. No spaces at the beginning or end.');
		} else {
			setCareerTitleValidationError('');
		}
	};

	const handleLocationChange = (newLocation) => {
		setLocation(newLocation);
		if (newLocation.trim() === '') {
			setLocationValidationError('Location is required');
		} else if (!validateLocationFormat(newLocation)) {
			setLocationValidationError('Format: City, XX (where XX is 2-letter state code)');
		} else {
			setLocationValidationError('');
		}
	};

	const handleFirstNameChange = (newFirstName) => {
		setFirstName(newFirstName);
		if (newFirstName.trim() === '') {
			setFirstNameValidationError('');
		} else if (!validateFirstNameFormat(newFirstName)) {
			setFirstNameValidationError('Letters only (no spaces, digits, or symbols)');
		} else {
			setFirstNameValidationError('');
		}
	};

	const handleLastNameChange = (newLastName) => {
		setLastName(newLastName);
		if (newLastName.trim() === '') {
			setLastNameValidationError('');
		} else if (!validateLastNameFormat(newLastName)) {
			setLastNameValidationError('Letters only (no spaces, digits, or symbols)');
		} else {
			setLastNameValidationError('');
		}
	};

	const hasAccountChanges =
		careerTitle !== initialCareerTitle ||
		location !== initialLocation ||
		firstName !== initialFirstName ||
		lastName !== initialLastName;
	const isLocationValid = location.trim() !== '' && validateLocationFormat(location);
	const isCareerTitleValid = careerTitle.trim() === '' || validateCareerTitleFormat(careerTitle);
	const isFirstNameValid = firstName.trim() === '' || validateFirstNameFormat(firstName);
	const isLastNameValid = lastName.trim() === '' || validateLastNameFormat(lastName);
	const hasAppearanceChanges = appearanceMode !== initialAppearanceMode;
	const accountSettingsCount = 8;
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
				const sourceUser = userData?.body || userData;

				let backendCareerTitle = '';
				if (typeof sourceUser?.careerTitle === 'string') {
					backendCareerTitle = sourceUser.careerTitle;
				} else if (Array.isArray(sourceUser?.careerTitle)) {
					backendCareerTitle = `{${sourceUser.careerTitle.join(',')}}`;
				} else if (sourceUser?.careerTitle != null) {
					backendCareerTitle = JSON.stringify(sourceUser.careerTitle);
				}
				if (!backendCareerTitle && typeof sourceUser?.position === 'string') {
					backendCareerTitle = sourceUser.position;
				}
				const normalizeCareerTitleValue = (value) => {
					if (typeof value !== 'string') return '';
					const stripped = value.replace(/^\{/, '').replace(/\}$/, '').trim();
					if (!stripped) return '';
					return stripped
						.split(',')
						.map((part) => part.trim())
						.filter(Boolean)
						.join(', ');
				};
				const backendLocation = sourceUser?.location || '';
				const resolvedCareerTitle = normalizeCareerTitleValue(backendCareerTitle) || normalizeCareerTitleValue(localStorage.getItem('profilePosition') || '');
				const resolvedLocation = backendLocation || localStorage.getItem('profileLocation') || '';

				const backendFirstName = sourceUser?.firstName || '';
				const backendLastName = sourceUser?.lastName || '';
				setCareerTitle(resolvedCareerTitle);
				setLocation(resolvedLocation);
				setFirstName(backendFirstName);
				setLastName(backendLastName);
				setInitialCareerTitle(resolvedCareerTitle);
				setInitialLocation(resolvedLocation);
				setInitialFirstName(backendFirstName);
				setInitialLastName(backendLastName);
				setUserAccountFields({
					firstName: sourceUser?.firstName || '',
					lastName: sourceUser?.lastName || '',
					email: sourceUser?.email || '',
					dateCreated: sourceUser?.dateCreated || ''
				});

				const validSchemes = ['Forest', 'Ocean', 'Sunset'];
				const backendAppearance = sourceUser?.curAppearanceScheme;
				const resolvedAppearance = validSchemes.includes(backendAppearance)
					? backendAppearance
					: (localStorage.getItem('curAppearanceScheme') || 'Forest');

				setAppearanceMode(resolvedAppearance);
				setInitialAppearanceMode(resolvedAppearance);
				localStorage.setItem('curAppearanceScheme', resolvedAppearance);
				window.dispatchEvent(new Event('appearanceChange'));
			} catch (err) {
				console.error('Failed to load settings user data:', err);
			}
		};

		fetchUserSettings();
	}, []);

	const handleSaveAccount = async () => {
		if (!hasAccountChanges || !isCareerTitleValid || !isLocationValid || !isFirstNameValid || !isLastNameValid || isSavingAccount) return;

		const username = localStorage.getItem('username');
		if (!username) {
			setSaveMessage('Failed to save account settings.');
			return;
		}

		setIsSavingAccount(true);

		try {
			const stage = 'https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev';
			const encode = window.btoa('admin:admin');

			const careerTitleUpdateUrl = `${stage}/Users/updateCareerTitle?username=${encodeURIComponent(username)}&newCareerTitle=${encodeURIComponent(careerTitle)}`;
			const careerTitleRes = await fetch(careerTitleUpdateUrl, {
				headers: { Authorization: 'Basic ' + encode },
				method: 'PATCH'
			});

			if (!careerTitleRes.ok) {
				throw new Error('Failed to update career title');
			}

			const locationUpdateUrl = `${stage}/Users/updateLocation?username=${encodeURIComponent(username)}&newLocation=${encodeURIComponent(location)}`;
			const locationRes = await fetch(locationUpdateUrl, {
				headers: { Authorization: 'Basic ' + encode },
				method: 'PATCH'
			});

			if (!locationRes.ok) {
				throw new Error('Failed to update location');
			}

			const firstNameUpdateUrl = `${stage}/Users/updateFirstName?username=${encodeURIComponent(username)}&newFirstName=${encodeURIComponent(firstName)}`;
			const firstNameRes = await fetch(firstNameUpdateUrl, {
				headers: { Authorization: 'Basic ' + encode },
				method: 'PATCH'
			});

			if (!firstNameRes.ok) {
				throw new Error('Failed to update first name');
			}

			const lastNameUpdateUrl = `${stage}/Users/updateLastName?username=${encodeURIComponent(username)}&newLastName=${encodeURIComponent(lastName)}`;
			const lastNameRes = await fetch(lastNameUpdateUrl, {
				headers: { Authorization: 'Basic ' + encode },
				method: 'PATCH'
			});

			if (!lastNameRes.ok) {
				throw new Error('Failed to update last name');
			}

			localStorage.setItem('profilePosition', careerTitle);
			localStorage.setItem('profileLocation', location);
			setInitialCareerTitle(careerTitle);
			setInitialLocation(location);
			setInitialFirstName(firstName);
			setInitialLastName(lastName);
			setSaveMessage('Account settings saved.');
		} catch (err) {
			console.error('Failed to save account settings:', err);
			setSaveMessage('Failed to save account settings.');
		} finally {
			setIsSavingAccount(false);
		}

		setTimeout(() => {
			setSaveMessage('');
		}, 2000);
	};

	const handleAppearanceChange = (newAppearanceScheme) => {
		setAppearanceMode(newAppearanceScheme);
		setAppearanceSaveMessage('');
	};

	const handleSaveAppearance = async () => {
		if (!hasAppearanceChanges || isSavingAppearance) return;

		const username = localStorage.getItem('username');
		if (!username) {
			setAppearanceSaveMessage('Failed to save appearance scheme.');
			return;
		}

		setIsSavingAppearance(true);

		try {
			const stage = 'https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev';
			const url = `${stage}/Users/updateCurAppearanceScheme?username=${encodeURIComponent(username)}&newAppearanceScheme=${encodeURIComponent(appearanceMode)}`;
			const encode = window.btoa('admin:admin');

			const res = await fetch(url, {
				headers: { Authorization: 'Basic ' + encode },
				method: 'PATCH'
			});

			if (!res.ok) {
				throw new Error('Failed to update appearance scheme');
			}

			localStorage.setItem('curAppearanceScheme', appearanceMode);
			setInitialAppearanceMode(appearanceMode);
			setAppearanceSaveMessage('Appearance scheme saved.');
			window.dispatchEvent(new Event('appearanceChange'));
		} catch (err) {
			console.error('Failed to update appearance scheme:', err);
			setAppearanceSaveMessage('Failed to save appearance scheme.');
		} finally {
			setIsSavingAppearance(false);
		}

		setTimeout(() => {
			setAppearanceSaveMessage('');
		}, 2000);
	};

	const updateProfilePictureFileName = async (username, fileName) => {
		try {
			const url = `https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev/Users/updateProfilePictureFileName?username=${encodeURIComponent(username)}&newFileName=${encodeURIComponent(fileName)}`;
			await fetch(url, { method: 'PATCH' });
		} catch (err) {
			console.error('Failed to update profilePictureFileName:', err);
		}
	};

	const tabButtonStyle = (tabName) => ({
		padding: '10px 16px',
		borderRadius: '8px',
		border: '1px solid #3a3a3c',
		backgroundColor: activeTab === tabName ? 'var(--nav-background)' : 'rgba(255, 255, 255, 0.4)',
		color: activeTab === tabName
			? (initialAppearanceMode === 'Sunset' ? '#000000' : '#ffffff')
			: '#000000',
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

	const appearanceSelectStyle = {
		...inputStyle,
		textTransform: 'capitalize'
	};

	const readOnlyFieldStyle = {
		...inputStyle,
		color: '#888'
	};

	const jsonEditorStyle = {
		...inputStyle,
		fontFamily: 'Consolas, monospace',
		resize: 'none',
		height: '44px',
		overflow: 'hidden'
	};

	return (<>
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
									<div className='settingsScrollableSection' style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, minHeight: 0, overflowY: activeSettingsCount > 3 ? 'auto' : 'hidden', paddingRight: '4px' }}>
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
											<label style={{ fontSize: '14px', fontWeight: '600', color: 'black' }}>Career Title</label>
											<textarea
												value={careerTitle}
												onChange={(e) => handleCareerTitleChange(e.target.value)}
												placeholder='Example: SDET, Software Engineer'
												rows={1}
												style={jsonEditorStyle}
											/>
											{careerTitleValidationError && (
												<span style={{
													fontSize: '12px',
													color: '#333333',
													backgroundColor: 'rgba(204, 0, 0, 0.2)',
													border: '1px solid rgba(204, 0, 0, 0.45)',
													padding: '6px 10px',
													borderRadius: '8px'
												}}>
													{careerTitleValidationError}
												</span>
											)}
										</div>

										<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
											<label style={{ fontSize: '14px', fontWeight: '600', color: 'black' }}>Location</label>
											<input
												value={location}
												onChange={(e) => handleLocationChange(e.target.value)}
												placeholder='Example: New York, NY'
												style={inputStyle}
											/>
											{locationValidationError && (
												<span style={{
													fontSize: '12px',
												color: '#333333',
													backgroundColor: 'rgba(204, 0, 0, 0.2)',
													border: '1px solid rgba(204, 0, 0, 0.45)',
													padding: '6px 10px',
													borderRadius: '8px'
												}}>
													{locationValidationError}
												</span>
											)}
										</div>

										<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
											<label style={{ fontSize: '14px', fontWeight: '600', color: 'black' }}>First Name</label>
											<input
												value={firstName}
												onChange={(e) => handleFirstNameChange(e.target.value)}
												placeholder='Enter your first name'
												style={inputStyle}
											/>
											{firstNameValidationError && (
												<span style={{
													fontSize: '12px',
													color: '#333333',
													backgroundColor: 'rgba(204, 0, 0, 0.2)',
													border: '1px solid rgba(204, 0, 0, 0.45)',
													padding: '6px 10px',
													borderRadius: '8px'
												}}>
													{firstNameValidationError}
												</span>
											)}
										</div>

										<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
											<label style={{ fontSize: '14px', fontWeight: '600', color: 'black' }}>Last Name</label>
											<input
												value={lastName}
												onChange={(e) => handleLastNameChange(e.target.value)}
												placeholder='Enter your last name'
												style={inputStyle}
											/>
											{lastNameValidationError && (
												<span style={{
													fontSize: '12px',
													color: '#333333',
													backgroundColor: 'rgba(204, 0, 0, 0.2)',
													border: '1px solid rgba(204, 0, 0, 0.45)',
													padding: '6px 10px',
													borderRadius: '8px'
												}}>
													{lastNameValidationError}
												</span>
													)}
												</div>

										<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
											<label style={{ fontSize: '14px', fontWeight: '600', color: 'black' }}>Date Created</label>
											<input value={userAccountFields.dateCreated} readOnly style={readOnlyFieldStyle} />
										</div>

										<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
											<label style={{ fontSize: '14px', fontWeight: '600', color: 'black' }}>Profile Picture</label>
											<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
												<input
													type='file'
													accept='.png,.jpg,.jpeg'
													style={{ display: 'none' }}
													id='profilePictureInput'
													onChange={handleProfilePictureFileSelect}
												/>
												{profilePictureFileNameError && (
													<span style={{
														fontSize: '12px',
														color: '#333333',
														backgroundColor: 'rgba(204, 0, 0, 0.2)',
														border: '1px solid rgba(204, 0, 0, 0.45)',
														padding: '6px 10px',
														borderRadius: '8px'
													}}>
														{profilePictureFileNameError}
													</span>
												)}
												<button
													type='button'
													onClick={() => document.getElementById('profilePictureInput').click()}
													style={{
														padding: '10px 16px',
														borderRadius: '8px',
														border: '1px solid #3a3a3c',
														backgroundColor: '#2c2c2e',
														color: '#ffffff',
														fontSize: '14px',
														fontWeight: '600',
														cursor: 'pointer',
														transition: 'background-color 0.2s'
													}}
												>
													Choose File
												</button>
												{profilePictureFile && (
													<>
														<p style={{
															fontSize: '13px',
															color: '#666',
															margin: '0',
															overflow: 'hidden',
															textOverflow: 'ellipsis',
															whiteSpace: 'nowrap'
														}}
														title={profilePictureFile.name}
														>
															Selected: {profilePictureFile.name}
														</p>
														<button
															type='button'
															onClick={handleProfilePictureUpload}
														disabled={isUploadingProfilePicture || profilePictureFileNameError}
														style={{
															padding: '10px 16px',
															borderRadius: '8px',
															border: '1px solid #3a3a3c',
															backgroundColor: (isUploadingProfilePicture || profilePictureFileNameError) ? 'var(--nav-background-disabled)' : 'var(--nav-background)',
															color: '#ffffff',
															fontSize: '14px',
															fontWeight: '600',
															cursor: (isUploadingProfilePicture || profilePictureFileNameError) ? 'not-allowed' : 'pointer',
																transition: 'background-color 0.2s'
															}}
														>
															{isUploadingProfilePicture ? 'Uploading...' : 'Upload to S3'}
														</button>
													</>
												)}
												{profilePictureUploadStatus && (
													<span style={{
														fontSize: '12px',
														color: '#000000',
														backgroundColor: profilePictureUploadStatus.includes('failed') ? 'rgba(255, 107, 107, 0.18)' : 'rgba(0, 184, 148, 0.18)',
														border: profilePictureUploadStatus.includes('failed') ? '1px solid rgba(255, 107, 107, 0.45)' : '1px solid rgba(0, 184, 148, 0.45)',
														padding: '6px 10px',
														borderRadius: '8px'
													}}>
														{profilePictureUploadStatus}
													</span>
												)}
											</div>
										</div>

									</div>

									<div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', borderTop: '1px solid #333', paddingTop: '12px' }}>
										{saveMessage !== '' ? (
											<span style={{
												fontSize: '12px',
												color: '#000000',
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
											disabled={!hasAccountChanges || !isCareerTitleValid || !isLocationValid || !isFirstNameValid || !isLastNameValid || isSavingAccount}
										style={{
											padding: '10px 20px',
											borderRadius: '8px',
											border: '1px solid #3a3a3c',
											backgroundColor: hasAccountChanges && isCareerTitleValid && isLocationValid && isFirstNameValid && isLastNameValid && !isSavingAccount ? 'var(--nav-background)' : 'var(--nav-background-disabled)',
											color: '#ffffff',
											fontSize: '14px',
											fontWeight: '400',
											cursor: hasAccountChanges && isCareerTitleValid && isLocationValid && isFirstNameValid && isLastNameValid && !isSavingAccount ? 'pointer' : 'not-allowed'
										}}
									>
										{isSavingAccount ? 'Saving...' : 'Save Account'}
									</button>
									</div>
								</div>
							) : (
								<div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%', minHeight: 0 }}>
									<div className='settingsScrollableSection' style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, minHeight: 0, overflowY: activeSettingsCount > 3 ? 'auto' : 'hidden', paddingRight: '4px' }}>
										<h3 style={{ margin: 0, fontSize: '18px', color: '#000000' }}>Appearance</h3>

										<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
											<label style={{ fontSize: '14px', fontWeight: '600', color: 'black'  }}>Color Scheme</label>
											<select
												value={appearanceMode}
												onChange={(e) => handleAppearanceChange(e.target.value)}
												style={appearanceSelectStyle}
											>
												<option value='Forest'>Forest</option>
												<option value='Ocean'>Ocean</option>
												<option value='Sunset'>Sunset</option>
											</select>
										</div>
									</div>

									<div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #333', paddingTop: '12px', minHeight: '38px' }}>
										{appearanceSaveMessage !== '' ? (
											<span style={{
												fontSize: '12px',
												color: '#000000',
												backgroundColor: appearanceSaveMessage.includes('Failed') ? 'rgba(204, 0, 0, 0.2)' : 'rgba(0, 153, 72, 0.18)',
												border: appearanceSaveMessage.includes('Failed') ? '1px solid rgba(204, 0, 0, 0.45)' : '1px solid rgba(0, 153, 72, 0.45)',
												padding: '6px 10px',
												borderRadius: '8px'
											}}>
												{appearanceSaveMessage}
											</span>
										) : null}
										<button
											onClick={handleSaveAppearance}
											disabled={!hasAppearanceChanges || isSavingAppearance}
											style={{
												padding: '10px 20px',
												borderRadius: '8px',
												border: '1px solid #3a3a3c',
												backgroundColor: hasAppearanceChanges && !isSavingAppearance ? 'var(--nav-background)' : 'var(--nav-background-disabled)',
												color: '#ffffff',
												fontSize: '14px',
												fontWeight: '400',
												cursor: hasAppearanceChanges && !isSavingAppearance ? 'pointer' : 'not-allowed',
												marginLeft: '12px'
											}}
										>
											{isSavingAppearance ? 'Saving...' : 'Save Appearance'}
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
