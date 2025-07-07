// src/App.jsx
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import LogAnalyzerPage from './pages/logAnalyzerPage';
import AboutPage from './pages/AboutPage';
import GrammarCheckerPage from './pages/GrammarCheckerPage';
import './App.css'; 

function App() {
  return (
    <BrowserRouter>
      <div>
        <header className="main-header">
          <h1>Analizador de Logs</h1>
          <nav className="main-nav">
            <NavLink to="/analizador-logs">Analizador de Logs</NavLink>
            <NavLink to="/acerca-de">Acerca del Proyecto</NavLink>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/analizador-logs" element={<LogAnalyzerPage />} />
            <Route path="/" element={<AboutPage />} />
            <Route path="/acerca-de" element={<AboutPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
export default App;