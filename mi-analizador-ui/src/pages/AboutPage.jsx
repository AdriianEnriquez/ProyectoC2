// src/pages/AboutPage.jsx
import styles from './AboutPage.module.css';
import { FaPuzzlePiece, FaSpellCheck, FaCogs, FaBook } from 'react-icons/fa';

const InfoCard = ({ icon, title, children }) => (
  <div className={styles.card}>
    <div className={styles.cardHeader}>
      <span className={styles.icon}>{icon}</span>
      <h3 className={styles.cardTitle}>{title}</h3>
    </div>
    <div className={styles.cardContent}>
      {children}
    </div>
  </div>
);

function AboutPage() {
  return (
    <div className={styles.container}>
      <div className={styles.mainHeader}>
        <h1>Sobre este Proyecto</h1>
        <p className={styles.subtitle}>
          Aplicando la Teoría de Compiladores a Problemas de Ciberseguridad
        </p>
      </div>

      <div className={styles.intro}>
        <p>
          Esta aplicación es una suite de herramientas diseñada para demostrar los principios de los compiladores. La herramienta principal es un <strong>Analizador de Logs para Servidores Linux</strong>, enfocado en detectar amenazas de seguridad analizando la estructura y el significado de los registros del sistema.
        </p>
      </div>

      {/* --- SECCIÓN MEJORADA: EXPLICACIÓN DE LOGS --- */}
      <div className={styles.logInfoSection}>
        <div className={styles.cardHeader}>
            <span className={styles.icon}><FaBook /></span>
            <h2 className={styles.cardTitle}>¿Qué son los Logs de un Servidor Linux?</h2>
        </div>
        <div className={styles.cardContent}>
            <p>
              Imagina que un <strong>servidor Linux</strong> lleva un diario detallado de todo lo que ocurre en su interior. Ese diario es un conjunto de archivos de <strong>log</strong>, comúnmente ubicados en `/var/log`. En este proyecto, nos enfocamos en logs cruciales para la seguridad como <strong>`auth.log`</strong> o <strong>`syslog`</strong>.
            </p>
            <p>
              En estos archivos se anota cada evento: un usuario que inicia sesión, un error del sistema, o un intento de acceso fallido. Analizarlos es clave para la ciberseguridad, pero su enorme tamaño hace imposible la revisión manual. Nuestra herramienta automatiza este proceso.
            </p>
        </div>
      </div>
      {/* --- FIN DE LA SECCIÓN MEJORADA --- */}

      <div className={styles.cardsContainer}>
        <InfoCard icon={<FaPuzzlePiece />} title="Análisis Léxico (El Diccionario)">
          <p>
            Es el primer paso. El analizador léxico escanea el texto del log y lo descompone en "piezas" fundamentales llamadas <strong>tokens</strong>.
            <br/><br/>
            <strong>En nuestro analizador:</strong> identifica componentes clave de un log de Linux como <strong>direcciones IP</strong>, <strong>fechas</strong>, nombres de proceso como <strong>`sshd`</strong>, y palabras clave como <strong>"Failed"</strong> o <strong>"Accepted"</strong>.
          </p>
        </InfoCard>

        <InfoCard icon={<FaSpellCheck />} title="Análisis Sintáctico (Las Reglas del Juego)">
          <p>
            Una vez que tenemos los tokens, el analizador sintáctico verifica si siguen el <strong>orden y la estructura</strong> esperada de una línea de log, siguiendo una gramática predefinida.
            <br/><br/>
            <strong>En nuestro analizador:</strong> comprueba que la línea tenga la forma `Fecha Host Proceso: Mensaje` y busca patrones específicos como el de un intento de login fallido para marcarlo como sintácticamente relevante.
          </p>
        </InfoCard>

        <InfoCard icon={<FaCogs />} title="Análisis Semántico (El Significado Profundo)">
          <p>
            Esta es la fase "inteligente". Interpreta el <strong>significado</strong> de las líneas que fueron sintácticamente correctas para encontrar amenazas reales.
            <br/><br/>
            <strong>En nuestro analizador:</strong> aquí se detecta un ataque. Una sola línea de `Failed password` no es una amenaza, pero ver <strong>cincuenta seguidas de la misma IP</strong> tiene el significado semántico de un <strong>ataque de fuerza bruta</strong>.
          </p>
        </InfoCard>
      </div>
    </div>
  );
}

export default AboutPage;