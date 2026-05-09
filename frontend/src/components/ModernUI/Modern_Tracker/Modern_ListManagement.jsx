import '../../../css/Modern_TrackerPageCSS.css';
import { useNavigate } from 'react-router-dom';

const Modern_ListManagement = ({filledLists, listName}) => {

    const navigate = useNavigate();

    const getListLabelFontSize = (name) => {
        if (!name) return '12px';
        if (name.length > 16) return '10px';
        if (name.length > 12) return '11px';
        return '13px';
    };

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
                            title={name || 'Empty'}
                            style={{
                                height: '30px',
                                width: '90px',
                                borderRadius: '20px',
                                padding: '1px 6px',
                                opacity: name ? 1 : 0.3,
                                cursor: name ? 'pointer' : 'not-allowed',
                                backgroundColor: listName !== name ? "" : "green",
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                overflow: 'hidden'
                            }}
                            onClick={() => name && navigate(`/tracker?listName=${name}`)}
                        >
                            <span style={{
                                fontSize: getListLabelFontSize(name),
                                lineHeight: '1.05',
                                whiteSpace: 'normal',
                                overflowWrap: 'anywhere',
                                wordBreak: 'break-word',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                            }}>
                                {name || "Empty"}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
export default Modern_ListManagement;