// src/context/AppContext.js
import { createContext, useContext, useState, useRef } from 'react';

/**
 * AppContext.js
 * 
 * Este archivo define un contexto global para React que permite compartir
 * y actualizar datos clave de la aplicación a lo largo de múltiples componentes,
 * sin necesidad de pasar props manualmente.
 * 
 * Este patrón se utiliza para mantener sincronizada la información global
 * relacionada con la visualización de modelos médicos (como rutas de archivos y datos de entrada).
 */

// Se crea el contexto de aplicación, que actuará como contenedor global de estado
const AppContext = createContext();

/**
 * AppProvider
 * 
 * Este componente envuelve tu aplicación y proporciona acceso global a las variables
 * compartidas que forman parte del flujo del visualizador.
 * 
 * Variables compartidas:
 * - aortaData: Información extraída desde el archivo `vesselEndsDict.pkl`, contiene coordenadas de entrada ("Aorta_inlet").
 * - filePath: Ruta relativa al archivo .vtp del modelo.
 * - graphPath: Ruta al archivo de grafo asociado (formato .gexf).
 * - calciumPath: Ruta al archivo .stl que representa el calcio.
 * - folderPath: Ruta completa al directorio base del modelo.
 * 
 * Estas variables pueden ser leídas o actualizadas desde cualquier componente
 * de React que consuma este contexto.
 */
export const AppProvider = ({ children }) => {
  const [aortaData, setAortaData] = useState(null); //Información de la aorta (Se usa para conocer posición del objeto y manejar la cámara)
  const [filePath, setFilePath] = useState(''); //Path fichero de datos
  const [graphPath, setGraphPath] = useState(''); //Path fichero con el grafo
  const [calciumPath, setCalciumPath] = useState('');  //Path fichero calcio
  const [folderPath, setFolderPath] = useState(''); // Path fichero principal
  const [viewsDictPath, setViewsDictPath] = useState('') //Path del json de viewsDict
  const [ostiumReferenceNodes, setOstiumReferenceNodes] = useState('') //Array con la información de los nodos del ostium

  const [isRadiusChecked, setIsRadiusChecked] = useState(false); //Diamter tick
  const [isFFRChecked, setIsFFRChecked] = useState(false);

  const [modelData, setModelData] = useState(null); //Modelo 3D

  const chartCanvasRef = useRef(null);
  const [isChartVisible, setIsChartVisible] = useState(false); // Visibilidad del gráfico
  const [chartData, setChartData] = useState(null); // Datos del gráfico
  const [chartOptions, setChartOptions] = useState({animation: false}); // Opciones del gráfico, desactivando animaciones por defecto
  const [labelsData, setLabelsData] = useState([]);


  const resetAppState = () => {
    console.warn("[WARNING] Resetting app state...");
    setAortaData(null);
    setFilePath('');
    setGraphPath('');
    setCalciumPath('');
    setFolderPath('');
    setOstiumReferenceNodes('');
    setViewsDictPath('')

    setModelData('');
    setIsRadiusChecked(false);
    setIsFFRChecked(false);

    setIsChartVisible(false);
    setChartData(null);
    setChartOptions({animation: false});
    setLabelsData([]);
  };

  return (
    <AppContext.Provider
      value={{
        aortaData, setAortaData,
        filePath, setFilePath,
        graphPath, setGraphPath,
        calciumPath, setCalciumPath,
        folderPath, setFolderPath,
        viewsDictPath, setViewsDictPath,
        ostiumReferenceNodes, setOstiumReferenceNodes,
        isChartVisible, setIsChartVisible,
        chartData, setChartData,
        modelData, setModelData,
        chartOptions, setChartOptions,
        labelsData, setLabelsData,
        isRadiusChecked, setIsRadiusChecked,
        isFFRChecked, setIsFFRChecked,
        chartCanvasRef,
        resetAppState
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

/**
 * useApp
 * 
 * Hook personalizado para acceder fácilmente al contexto global.
 * En lugar de usar `useContext(AppContext)` directamente en cada componente,
 * puedes importar y usar `useApp()` para mejorar la legibilidad.
 * 
 * @returns {object} Objeto con las variables y funciones del contexto global.
 * 
 * Uso:
 *   const { filePath, setFilePath } = useApp();
 */
export const useApp = () => useContext(AppContext);
