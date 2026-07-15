import '../../../css/Modern_TrackerPageCSS.css';
import { useNavigate } from 'react-router-dom';

const ModernListManagement = ({
    listNames = [],
    listName,
    toggleNewListPopup,
    toggleDeletePopup,
    canDeleteCurrentList = false
}) => {
    const navigate = useNavigate();
    const lists = (Array.isArray(listNames) ? listNames : []).filter(Boolean);

    return (
        <div style={{
            width: '100%',
            padding: '8px',
            background: 'rgba(255, 255, 255, 0.4)',
            border: '0.1px solid black',
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            boxSizing: 'border-box',
            flexShrink: 0,
            marginTop: 'auto'
        }}>
            <p style={{ margin: '0px', fontSize: '20px', color: 'black', fontWeight: '600' }}>
                List Management
            </p>
            <p style={{
                margin: '0px',
                fontSize: '12px',
                color: '#333',
                textAlign: 'center',
                lineHeight: '1.25',
                padding: '0 4px'
            }}>
                Select a list to view its applications.
            </p>

            <div style={{
                width: '90%',
                height: '140px',
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                boxSizing: 'border-box'
            }}>
            <div
                className='modernSearchResultsContainer'
                style={{
                    width: '100%',
                    height: '128px',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    background: 'white',
                    border: '1px solid black',
                    boxSizing: 'content-box',
                    flexShrink: 0
                }}
            >
                {lists.length === 0 ? (
                    <div style={{ padding: '10px 8px', color: 'gray', fontSize: '13px' }}>
                        You have no current lists, create one.
                    </div>
                ) : (
                    lists.map((name) => {
                        const isSelected = listName === name;
                        return (
                            <button
                                key={name}
                                type="button"
                                onClick={() => navigate(`/tracker?listName=${encodeURIComponent(name)}`)}
                                style={{
                                    width: '100%',
                                    height: '32px',
                                    display: 'block',
                                    textAlign: 'left',
                                    padding: '0 10px',
                                    border: 'none',
                                    borderBottom: 'solid 0.5px black',
                                    cursor: 'pointer',
                                    backgroundColor: isSelected ? 'green' : 'transparent',
                                    color: isSelected ? 'white' : 'black',
                                    fontSize: '14px',
                                    lineHeight: '32px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    boxSizing: 'border-box'
                                }}
                                title={name}
                            >
                                {name}
                            </button>
                        );
                    })
                )}
            </div>
            </div>

            <div style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '8px',
                width: '90%',
                justifyContent: 'center',
                flexWrap: 'wrap'
            }}>
                <button
                    type="button"
                    onClick={toggleNewListPopup}
                    style={{
                        height: '32px',
                        minWidth: '110px',
                        flex: 1,
                        borderRadius: '20px',
                        marginBottom: '0px'
                    }}
                >
                    + New List
                </button>
                <button
                    type="button"
                    onClick={toggleDeletePopup}
                    disabled={!canDeleteCurrentList}
                    title={canDeleteCurrentList ? `Delete "${listName}"` : 'Select a list first'}
                    style={{
                        height: '32px',
                        minWidth: '110px',
                        flex: 1,
                        borderRadius: '20px',
                        marginBottom: '0px',
                        opacity: canDeleteCurrentList ? 1 : 0.45,
                        cursor: canDeleteCurrentList ? 'pointer' : 'not-allowed'
                    }}
                >
                    - Delete List
                </button>
            </div>
        </div>
    );
};

export default ModernListManagement;
