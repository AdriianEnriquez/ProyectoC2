import styles from './ResultsDisplay.module.css';
import AnalysisVerdict from './AnalysisVerdict';
import TokenTable from './TokenTable';

function ResultsDisplay({ results, onReset }) {
  if (!results) {
    return (
      <div className={styles.container}>
        <p>Error: No se recibieron resultados para mostrar.</p>
        <button onClick={onReset} className={styles.resetButton}>Intentar de nuevo</button>
      </div>
    );
  }

  const { lexicalAnalysis, syntacticAnalysis, semanticAnalysis, structuralAnalysis } = results;

  return (
    <div className={styles.container}>
      <AnalysisVerdict 
        syntacticAnalysis={syntacticAnalysis} 
        semanticAnalysis={semanticAnalysis} 
      />
      
      <TokenTable lexicalAnalysis={lexicalAnalysis} />

      {structuralAnalysis && structuralAnalysis.length > 0 && (
        <div className={styles.structuralContainer}>
          <h3 className={styles.structuralTitle}>⚠️ Verificación Estructural Adicional</h3>
          <ul className={styles.structuralList}>
            {structuralAnalysis.map((finding, index) => (
              <li key={index} className={styles.structuralItem}>
                <strong>Línea {finding.lineNumber}:</strong> {finding.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button onClick={onReset} className={styles.resetButton}>
        Analizar otro texto
      </button>
    </div>
  );
}

export default ResultsDisplay;