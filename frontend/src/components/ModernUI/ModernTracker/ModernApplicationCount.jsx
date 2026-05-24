import '../../../css/Modern_TrackerPageCSS.css';

const ModernApplicationCount = ({waitingJobs, rejectedJobs}) => {

    

    return (
        <div style={{border: '0.1px solid black', display: 'flex', justifyContent: 'center', gap: '30px', width: '80%'}}>
            <div style={{alignItems: 'center', display: 'flex', flexDirection: 'column'}}>
                <p style={{color: 'black', padding: '0px', marginTop: '5px', marginBottom: '0px'}}>Waiting: </p>
                <div style={{background: 'white', borderRadius: '5px', padding: '0px 5px', width: '60%', height: '45%'}}>
                    <p style={{color: 'green', padding: '0px', marginTop: '0px', marginBottom: '5px'}}>{waitingJobs}</p>
                </div>
            </div>

            <div style={{alignItems: 'center', display: 'flex', flexDirection: 'column'}}>
                <p style={{color: 'black', padding: '0px', marginTop: '5px', marginBottom: '0px'}}>Rejected: </p>
                <div style={{background: 'white', borderRadius: '5px', padding: '0px 5px', width: '60%', height: '45%'}}>
                    <p style={{color: 'red', padding: '0px', marginTop: '0px', marginBottom: '5px'}}>{rejectedJobs}</p>
                </div>
                
            </div>
        </div>
    );
};
export default ModernApplicationCount;