import '../../../css/Modern_TrackerPageCSS.css';

const ModernApplicationCount = ({waitingJobs, rejectedJobs}) => {

    

    return (
        <div style={{
            width: '80%',
            background: 'rgba(255, 255, 255, 0.4)',
            border: '0.1px solid black',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'center',
            gap: '30px',
            flexShrink: 0
        }}>
            <div style={{alignItems: 'center', display: 'flex', flexDirection: 'column'}}>
                <p style={{color: 'black', padding: '0px', marginTop: '5px', marginBottom: '0px'}}>Waiting: </p>
                <div style={{background: 'white', borderRadius: '5px', padding: '0px 5px', width: '60%', height: '45%', marginBottom: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <p style={{color: 'green', padding: '0px', margin: '0px'}}>{waitingJobs}</p>
                </div>
            </div>

            <div style={{alignItems: 'center', display: 'flex', flexDirection: 'column'}}>
                <p style={{color: 'black', padding: '0px', marginTop: '5px', marginBottom: '0px'}}>Rejected: </p>
                <div style={{background: 'white', borderRadius: '5px', padding: '0px 5px', width: '60%', height: '45%', marginBottom: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <p style={{color: 'red', padding: '0px', margin: '0px'}}>{rejectedJobs}</p>
                </div>
                
            </div>
        </div>
    );
};
export default ModernApplicationCount;