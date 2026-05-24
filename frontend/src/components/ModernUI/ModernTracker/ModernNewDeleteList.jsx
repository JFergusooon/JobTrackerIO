import '../../../css/Modern_TrackerPageCSS.css';

const ModernNewDeleteList = ({toggleDeletePopup, toggleNewListPopup, canDeleteCurrentList = false}) => {

    

    return (
        <div style={{display: 'flex', flexDirection: 'row', gap: '2%', marginBottom: '0px'}}>
            <button onClick={toggleNewListPopup} style={{height: '30px', width: '120px', borderRadius: '20px', marginBottom: '0px'}}>+ New List</button>
            <button
                onClick={toggleDeletePopup}
                disabled={!canDeleteCurrentList}
                style={{
                    height: '30px',
                    width: '150px',
                    borderRadius: '20px',
                    marginBottom: '0px',
                    opacity: canDeleteCurrentList ? 1 : 0.45,
                    cursor: canDeleteCurrentList ? 'pointer' : 'not-allowed'
                }}
            >
                Delete Current List
            </button>
        </div>
    );
};
export default ModernNewDeleteList;