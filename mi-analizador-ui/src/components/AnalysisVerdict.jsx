// src/components/AnalysisVerdict.jsx
import styles from './AnalysisVerdict.module.css';
import AlertCard from './AlertCard';

const AnalysisVerdict = ({ syntacticAnalysis, semanticAnalysis }) => {
  // Código de defensa para evitar errores
  const safeSyntactic = syntacticAnalysis ?? [];
  const safeSemantic = semanticAnalysis ?? [];

  const successfulParses = safeSyntactic.filter(item => item.status === 'ÉXITO').length;
  const totalParsable = safeSyntactic.length;

  return (
    <div className={styles.verdictCard}>
      <h3 className={styles.title}>Análisis Sintáctico y Semántico</h3>
      
      {/* Sección Semántica (Alertas de Seguridad) */}
      <div className={styles.section}>
        <h4>Veredicto Semántico (Amenazas)</h4>
        {safeSemantic.length > 0 ? (
          safeSemantic.map(alert => <AlertCard key={alert.id} alert={alert} />)
        ) : (
          <p className={styles.noErrors}>
            No se encontraron amenazas de seguridad en las líneas válidas.
          </p>
        )}
      </div>

      {/* Sección Sintáctica (Reporte de Estructura) */}
      <div className={styles.section}>
        <h4>Reporte Sintáctico (Línea por Línea)</h4>
        <p className={styles.syntaxSummary}>
          Resumen: <strong>{successfulParses} de {totalParsable}</strong> líneas analizadas tienen una estructura de log de error conocida.
        </p>
        
        {/* Lista detallada con los nuevos estilos e íconos */}
        <div className={styles.reportList}>
          {safeSyntactic.map(item => (
            <div key={item.lineNumber} className={styles.reportItem}>
              <span className={`${styles.status} ${item.status === 'ÉXITO' ? styles.success : styles.failure}`}>
                <span className={item.status === 'ÉXITO' ? styles.successIcon : styles.failureIcon}>
                  {item.status === 'ÉXITO' ? '✓' : '✗'}
                </span>
                Línea {item.lineNumber}: {item.status}
              </span>
              <span className={styles.reason}>{item.reason}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalysisVerdict;