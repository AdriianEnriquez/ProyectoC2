
import styles from './FileUpload.module.css';
import { FiFile } from 'react-icons/fi';

const FileUpload = ({ onFileSelect, selectedFile }) => {
  
  const handleFileChange = (event) => {
    onFileSelect(event.target.files[0]);
  };

  return (
    <label htmlFor="file-upload" className={`${styles.dropzone} ${selectedFile ? styles.dropzoneActive : ''}`}>
      <input
        id="file-upload"
        type="file"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <FiFile size="3em" color="#a0aec0" />
      <p>
        {selectedFile ? (
          <span className={styles.fileName}>{selectedFile.name}</span>
        ) : (
          'Haz clic o arrastra un archivo aquí'
        )}
      </p>
    </label>
  );
};

export default FileUpload;