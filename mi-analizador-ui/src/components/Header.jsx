
import styles from './Header.module.css';
import { FaShieldVirus } from 'react-icons/fa'; 

const Header = () => {
  return (
    <header className={styles.header}>
      <FaShieldVirus size="2em" color="#38b2ac" />
      <h1 className={styles.title}>
        Analizador de Logs de Seguridad
      </h1>
    </header>
  );
};

export default Header;