import '../../../css/Modern_TrackerPageCSS.css';
import { useNavigate } from 'react-router-dom';

const Modern_ListManagement = ({filledLists, listName}) => {

    const navigate = useNavigate();

    return (
        <div style={{padding: '5px', background: 'rgba(255, 255, 255, 0.3)', border: '0.1px solid black', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px'}}>
            <p style={{margin: '0px', fontSize: '20px', color: 'black'}}>--- List Management ---</p>
            <p style={{margin: '0px', fontSize: '16px', color: 'black'}}>Current List: {listName}</p>
                
            <div style={{display: 'flex', flexDirection: 'row', gap: '5px'}}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 90px)', gap: '5px' }}>
                    {filledLists.map((name, index) => (
                        <button
                            key={index}
                            disabled={!name}
                            style={{
                                height: '30px',
                                width: '90px',
                                borderRadius: '20px',
                                opacity: name ? 1 : 0.3,
                                cursor: name ? 'pointer' : 'not-allowed',
                                backgroundColor: listName !== name ? "" : "green"
                            }}
                            onClick={() => name && navigate(`/tracker?listName=${name}`)}
                        >
                            {name || "Empty"}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
export default Modern_ListManagement;