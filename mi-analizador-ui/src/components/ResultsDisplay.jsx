// src/components/ResultsDisplay.jsx
import styles from './ResultsDisplay.module.css';
import AnalysisVerdict from './AnalysisVerdict';
import TokenTable from './TokenTable';

function ResultsDisplay({ results, onReset }) {
  // Añadimos una capa de protección por si 'results' llega a ser nulo.
  if (!results) {
    return (
      <div className={styles.container}>
        <p>Error: No se recibieron resultados para mostrar.</p>
        <button onClick={onReset} className={styles.resetButton}>Intentar de nuevo</button>
      </div>
    );
  }

  // Ahora es seguro desestructurar los datos.
  const { lexicalAnalysis, syntacticAnalysis, semanticAnalysis } = results;

  return (
    <div className={styles.container}>
      {/* 1. La parte de arriba: El veredicto sintáctico y las alertas semánticas (de seguridad) */}
      <AnalysisVerdict 
        syntacticAnalysis={syntacticAnalysis} 
        semanticAnalysis={semanticAnalysis} 
      />
      
      {/* 2. La parte de abajo: La tabla detallada con el análisis léxico */}
      <TokenTable lexicalAnalysis={lexicalAnalysis} />

      <button onClick={onReset} className={styles.resetButton}>
        Analizar otro texto
      </button>
    </div>
  );
}

export default ResultsDisplay;