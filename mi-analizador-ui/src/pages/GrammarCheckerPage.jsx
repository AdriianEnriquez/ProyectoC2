// src/pages/GrammarCheckerPage.jsx
import { useState } from 'react';
import styles from './GrammarCheckerPage.module.css';
import Spinner from '../components/Spinner';
import GrammarErrorCard from '../components/GrammarErrorCard';

function GrammarCheckerPage() {
  const [textInput, setTextInput] = useState('');
  const [errors, setErrors] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');

  const handleAnalyze = async () => {
    setIsLoading(true);
    setErrors(null);
    setFetchError('');

    try {
      const response = await fetch('http://localhost:8080/api/analyze-grammar', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: textInput,
      });

      if (!response.ok) {
        throw new Error(`Error en la respuesta del servidor: ${response.statusText}`);
      }

      const data = await response.json();
      setErrors(data);
    } catch (err) {
      setFetchError('No se pudo conectar con el servidor. ¿Está corriendo?');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Corrector Gramatical y de Estilo</h1>
      <p className={styles.subtitle}>
        Analiza fragmentos de texto en español para encontrar errores comunes.
      </p>

      <textarea
        className={styles.textArea}
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
        placeholder="Escribe o pega aquí el texto que quieres analizar...&#10;Ej: hola mundo. la perro corre. este texto es incorrepto"
      />

      <button 
        onClick={handleAnalyze} 
        className={styles.analyzeButton} 
        disabled={!textInput.trim() || isLoading}
      >
        Revisar Texto
      </button>

      {isLoading && <Spinner />}
      {fetchError && <p style={{color: 'red'}}>{fetchError}</p>}

      {errors && (
        <div className={styles.resultsContainer}>
          <h3>Resultados del Análisis:</h3>
          {errors.length === 0 ? (
            <p className={styles.noErrorsFound}>¡Excelente! No se encontraron errores según nuestras reglas.</p>
          ) : (
            errors.map((error, index) => <GrammarErrorCard key={index} error={error} />)
          )}
        </div>
      )}
    </div>
  );
}

export default GrammarCheckerPage;