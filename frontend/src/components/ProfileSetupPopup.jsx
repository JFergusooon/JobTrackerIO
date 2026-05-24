import React from 'react';

const ProfileSetupPopup = ({ closePopup, onGoToSettings, missingFields = [] }) => {
    const handleGoToSettings = () => {
        if (typeof onGoToSettings === 'function') {
            onGoToSettings();
            return;
        }

        closePopup();
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.45)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 10000,
            }}
            onClick={closePopup}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.88)',
                    borderRadius: '16px',
                    padding: '30px',
                    width: '500px',
                    maxWidth: '92vw',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                    border: '1px solid #2f2f2f',
                    color: '#f0f0f0',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
            >
                <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', color: '#ffffff' }}>
                    Finish Your Profile
                </h2>
                <p style={{ margin: '0 0 18px 0', color: '#c3c3c3', lineHeight: '1.5' }}>
                    Welcome to JobTracker. To get started, please add your {missingFields.join(' and ')} in Settings.
                </p>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button
                        onClick={closePopup}
                        style={{
                            padding: '10px 18px',
                            borderRadius: '8px',
                            border: '1px solid #4b4b4b',
                            backgroundColor: '#2c2c2e',
                            color: '#f0f0f0',
                            cursor: 'pointer',
                            fontWeight: 600,
                        }}
                    >
                        Later
                    </button>
                    <button
                        onClick={handleGoToSettings}
                        style={{
                            padding: '10px 18px',
                            borderRadius: '8px',
                            border: '1px solid transparent',
                            backgroundColor: '#4a9eff',
                            color: '#ffffff',
                            cursor: 'pointer',
                            fontWeight: 600,
                        }}
                    >
                        Go to Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileSetupPopup;
