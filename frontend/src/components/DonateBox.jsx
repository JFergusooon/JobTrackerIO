import React from 'react';

function DonateBox() {
	const handlePayPalDonate = () => {
		// Replace with your actual PayPal donation link
		window.open('https://www.paypal.me/bepposir', '_blank');
	};

	const handleVenmoDonate = () => {
		// Replace with your actual Venmo profile URL or payment link
		window.open('https://venmo.com/Jeffrey-Ferguson-75', '_blank');
	};

	return (
		<div style={{
			backgroundColor: 'rgba(255, 255, 255, 0.4)',
			borderRadius: '16px',
			padding: '24px 20px',
			width: '200px',
			border: '0.1px solid black',
			display: 'flex',
			flexDirection: 'column',
			gap: '16px',
			height: 'fit-content'
		}}>
			<div>
				<h3 style={{
					margin: '0 0 8px',
					fontSize: '18px',
					fontWeight: '700',
					color: '#000000'
				}}>
					Support Us
				</h3>
				<p style={{
					margin: 0,
					fontSize: '12px',
					color: '#333333',
					lineHeight: '1.4'
				}}>
					Help us keep JobTracker free and improving
				</p>
			</div>

			<button
				onClick={handlePayPalDonate}
				style={{
					padding: '10px 14px',
					borderRadius: '8px',
					border: '1px solid #3a3a3c',
					backgroundColor: '#0070ba',
					color: '#ffffff',
					fontSize: '13px',
					fontWeight: '600',
					cursor: 'pointer',
					transition: 'background-color 0.2s',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					gap: '8px'
				}}
				onMouseOver={(e) => e.target.style.backgroundColor = '#005a94'}
				onMouseOut={(e) => e.target.style.backgroundColor = '#0070ba'}
			>
				<span style={{ fontSize: '16px' }}>𝐏</span> PayPal
			</button>

			<button
				onClick={handleVenmoDonate}
				style={{
					padding: '10px 14px',
					borderRadius: '8px',
					border: '1px solid #3a3a3c',
					backgroundColor: '#3d95ce',
					color: '#ffffff',
					fontSize: '13px',
					fontWeight: '600',
					cursor: 'pointer',
					transition: 'background-color 0.2s',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					gap: '8px'
				}}
				onMouseOver={(e) => e.target.style.backgroundColor = '#2d7ab8'}
				onMouseOut={(e) => e.target.style.backgroundColor = '#3d95ce'}
			>
				<span style={{ fontSize: '16px' }}>💰</span> Venmo
			</button>

			<p style={{
				margin: 0,
				fontSize: '11px',
				color: '#666666',
				textAlign: 'center',
				lineHeight: '1.3'
			}}>
				Every bit helps support development
			</p>
		</div>
	);
}

export default DonateBox;
