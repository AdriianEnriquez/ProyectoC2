import { useState } from 'react';
import FileUpload from '../components/FileUpload';
import ResultsDisplay from '../components/ResultsDisplay';
import Spinner from '../components/Spinner';
import styles from './LogAnalyzerPage.module.css';

const MOCK_RESULTS = { status: 'success', fileName: 'auth.log.gz', summary: { linesProcessed: 5231, alertsFound: 3, }, alerts: [ { id: 'alert-001', severity: 'ALTA', type: 'Fuerza Bruta', details: 'Se detectaron 150 intentos de login fallidos en 2 minutos.', ip_address: '1.2.3.4', }, { id: 'alert-002', severity: 'MEDIA', type: 'Comando Peligroso', details: "El usuario 'fulanito' ejecutó un comando riesgoso.", user: 'fulanito', }, { id: 'alert-003', severity: 'BAJA', type: 'IP en Lista Negra', details: 'Conexión desde una IP conocida por actividades maliciosas.', ip_address: '8.8.8.8', }, ], };

function LogAnalyzerPage() {
  const [inputType, setInputType] = useState('file');
  const [selectedFile, setSelectedFile] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    setIsLoading(true);
    setResults(null);
    setError('');

    let body;
    let headers = {};

    if (inputType === 'file') {
        if (!selectedFile) {
            setError('Por favor, selecciona un archivo.');
            setIsLoading(false);
            return;
        }
        body = new FormData();
        body.append('logFile', selectedFile);
    } else {
        if (!textInput.trim()) {
            setError('Por favor, pega o escribe algo de texto.');
            setIsLoading(false);
            return;
        }
        body = textInput;
        headers['Content-Type'] = 'text/plain';
    }

    try {
      const response = await fetch('http://localhost:8080/api/analyze-logs', { 
            method: 'POST',
            headers: headers,
            body: body,
        });
        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        
        setResults(data);

    } catch (err) {
        console.error("Error al conectar con el backend:", err);
        setError('No se pudo conectar con el servidor de análisis. ¿Está corriendo en la otra terminal?');
    } finally {
        setIsLoading(false);
    }
};

  const handleReset = () => { setResults(null); setError(''); setSelectedFile(null); setTextInput(''); }
  const isAnalyzeDisabled = (inputType === 'file' && !selectedFile) || (inputType === 'text' && !textInput.trim());

  return (
    <div className={styles.container}>
      <h1 style={{textAlign: 'center'}}>Herramienta de Análisis de Logs</h1>
      {isLoading ? <Spinner /> : results ? <ResultsDisplay results={results} onReset={handleReset} /> : (
        <>
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${inputType === 'file' ? styles.tabActive : ''}`} onClick={() => setInputType('file')}>Subir Archivo</button>
            <button className={`${styles.tab} ${inputType === 'text' ? styles.tabActive : ''}`} onClick={() => setInputType('text')}>Pegar Texto</button>
          </div>
          <div className={styles.content}>
            {inputType === 'file' ? (
              <FileUpload onFileSelect={setSelectedFile} selectedFile={selectedFile} />
            ) : (
              <textarea className={styles.textArea} value={textInput} onChange={(e) => setTextInput(e.target.value)} placeholder="Pega aquí un fragmento de tu log..."/>
            )}
            <button onClick={handleAnalyze} className={styles.analyzeButton} disabled={isAnalyzeDisabled || isLoading}>Analizar</button>
            {error && <p style={{color: 'red'}}>{error}</p>}
          </div>
        </>
      )}
    </div>
  );
}
export default LogAnalyzerPage;