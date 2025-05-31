import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullhorn } from '@fortawesome/free-solid-svg-icons';

function AnnouncementIcon() {
    return (
        <div
        style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            cursor: 'pointer',
            zIndex: '1000',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: '#b7b2b2c7',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}
        className="announcement">
            <FontAwesomeIcon
                icon={faBullhorn}
                style={{
                    fontSize: '24px',
                    color: '#0077ff',
                    cursor: 'pointer',
                }}
            />
        </div>
    );
}

export default AnnouncementIcon;
