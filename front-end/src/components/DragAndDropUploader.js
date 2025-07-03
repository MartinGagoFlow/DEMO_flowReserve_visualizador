// DragAndDropUploader.js
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const DragAndDropUploader = ({ onFilesSelected }) => {
  const onDrop = useCallback((acceptedFiles) => {
    // Aquí puedes filtrar los archivos según su extensión
    const vtpFiles = acceptedFiles.filter(file => file.name.endsWith('.vtp'));
    const gexfFiles = acceptedFiles.filter(file => file.name.endsWith('.gexf'));

    // Llama a la función del padre con los archivos seleccionados
    onFilesSelected({ vtpFiles, gexfFiles });
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    // Puedes agregar "accept" para limitar los tipos de archivo
    accept: {
      'application/xml': ['.vtp', '.gexf'],
      // O simplemente:
      'text/xml': ['.vtp', '.gexf']
    }
  });

  return (
    <div {...getRootProps()} style={{
      border: '2px dashed #888',
      padding: '20px',
      textAlign: 'center'
    }}>
      <input {...getInputProps()} />
      { isDragActive ?
        <p>Suelta los archivos aquí...</p> :
        <p>Arrastra y suelta los archivos aquí, o haz click para seleccionarlos.</p>
      }
    </div>
  );
};

export default DragAndDropUploader;
