import '../../../css/Modern_TrackerPageCSS.css';
import { useNavigate } from 'react-router-dom';

const Modern_NewDeleteList = ({toggleDeletePopup, toggleNewListPopup}) => {

    

    return (
        <div style={{display: 'flex', flexDirection: 'row', gap: '2%', marginBottom: '0px'}}>
            <button onClick={toggleNewListPopup} style={{height: '30px', width: '120px', borderRadius: '20px', marginBottom: '0px'}}>+ New List</button>
            <button onClick={toggleDeletePopup} style={{height: '30px', width: '150px', borderRadius: '20px', marginBottom: '0px'}}>Delete Current List</button>
        </div>
    );
};
export default Modern_NewDeleteList;