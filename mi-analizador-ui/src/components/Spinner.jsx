import styles from './Spinner.module.css';
const Spinner = () => (
  <div className={styles.spinnerContainer}>
    <div className={styles.spinner}></div>
    <p>Analizando, el detective está trabajando...</p>
  </div>
);
export default Spinner;