import styles from './AlertCard.module.css';
import { FaExclamationTriangle, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';

const severityMap = {
  ALTA: { className: styles.alta, icon: <FaExclamationTriangle /> },
  MEDIA: { className: styles.media, icon: <FaExclamationCircle /> },
  BAJA: { className: styles.baja, icon: <FaInfoCircle /> },
};

const AlertCard = ({ alert }) => {
  const { severity, type, details, ip_address, user } = alert;
  const config = severityMap[severity] || severityMap.BAJA;

  return (
    <div className={`${styles.card} ${config.className}`}>
      <div className={styles.header}>
        <span className={styles.icon}>{config.icon}</span>
        <h3 className={styles.title}>{type}</h3>
      </div>
      <div className={styles.details}>
        <p>{details}</p>
        <div className={styles.meta}>
          {ip_address && <p>IP: <strong>{ip_address}</strong></p>}
          {user && <p>Usuario: <strong>{user}</strong></p>}
        </div>
      </div>
    </div>
  );
};
export default AlertCard;