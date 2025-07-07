// src/components/TokenTable.jsx
import styles from './TokenTable.module.css';

const columns = ['Tokens', 'PR/Tipo', 'ID', 'Numero', 'String', 'Simbolo'];
const tokenTypeToColumn = {
  KEYWORD: 'PR/Tipo',
  PROCESS: 'PR/Tipo',
  USER: 'ID',
  HOSTNAME: 'ID',
  IP: 'String',
  TIMESTAMP: 'String',
  PID: 'Numero',
  SEPARATOR: 'Simbolo',
  UNKNOWN: 'Simbolo',
};

const TokenTable = ({ lexicalAnalysis }) => {
  const analysisToShow = (lexicalAnalysis ?? []).slice(0, 50); 

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Análisis Léxico Detallado</h3>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map(col => <th key={col}>{col}</th>)}
            </tr>
          </thead>
          <tbody>
            {analysisToShow.map(lineResult => (
              (lineResult.tokens ?? []).map((token, tokenIndex) => (
                <tr key={`${lineResult.lineNumber}-${tokenIndex}`}>
                  {columns.map(colName => {
                    if (colName === 'Tokens') {
                      return <td key={colName}><code>{token.value}</code></td>;
                    }
                    const targetColumn = tokenTypeToColumn[token.type];
                    return <td key={colName}>{colName === targetColumn ? 'X' : ''}</td>;
                  })}
                </tr>
              ))
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TokenTable;