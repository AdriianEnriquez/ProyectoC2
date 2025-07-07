// src/components/GrammarErrorCard.jsx
import styles from './GrammarErrorCard.module.css';

// Asigna un estilo diferente a cada tipo de error
const errorStyles = {
  "Léxico (Ortografía)": styles.lexico,
  "Sintáctico (Estructura)": styles.sintactico,
  "Semántico (Significado)": styles.semantico,
};

const GrammarErrorCard = ({ error }) => {
  // Los nombres de los campos vienen del JSON del backend
  const { line, errorType, fragment, message, suggestion } = error;
  const cardClass = errorStyles[errorType] || '';

  return (
    <div className={`${styles.card} ${cardClass}`}>
      <div className={styles.header}>
        <span className={styles.errorType}>{errorType}</span>
        <span className={styles.line}>Línea: {line}</span>
      </div>
      <p className={styles.message}>
        <strong>Error en "{fragment}"</strong>: {message}
      </p>
      {suggestion && (
        <p className={styles.suggestion}>
          <strong>Sugerencia:</strong> {suggestion}
        </p>
      )}
    </div>
  );
};

export default GrammarErrorCard;