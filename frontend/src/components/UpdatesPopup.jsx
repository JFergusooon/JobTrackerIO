import '../css/ModernLoginCSS.css';

const UpdatesPopup = ({text, closePopup}) => {


    return (
        <div className='popup'>
            <div className='popup_open'>
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex",
                             justifyContent: "center", alignItems: "center", zIndex: 9999, }}>
                    {/* Actual Login Box */}
                    <div onClick={(e) => e.stopPropagation()} className='loginFormContainer'>
                        <button onClick={closePopup} className='loginCloseButton'> × </button>

                        <h2 style={{ marginTop: 0 }}>Updates</h2>

                        <p style={{textAlign: 'left'}}>New Modern UI</p>
                        <p style={{textAlign: 'left'}}>Home Screen Changes:</p>
                        <p style={{textAlign: 'left'}}>ProfileBox Setup</p>
                        <p style={{textAlign: 'left'}}>StatsChart grabs last 6 months</p>

                    </div>    
                </div>
            </div>
        </div>
    );
};
export default UpdatesPopup;