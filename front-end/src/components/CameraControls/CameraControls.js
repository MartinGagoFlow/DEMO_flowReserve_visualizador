// src/components/CameraControls.js

import { useState } from 'react';
import { useAnimateCamera } from '../../utils/camera/cameraUtils';
import CustomButton from '../global/CustomButton';
import useCameraViews from '../../utils/camera/moveCameraUtils';
import './CameraControls.css';
import { useApp } from '../../context/AppContext';


const CameraControls = () => {

  const { aortaData, ostiumReferenceNodes } = useApp(); //Importación de los datos de la aorta y los nodos de referencia.
  const { visualizadorFrontal, visualizadorTrasero, visualizadorLateralIzquierdo, visualizadorLateralDerecho } = useCameraViews(); //Importación de las funciones de movimiento de cámara.
  const { animateCameraToPosition, getCurrentView } = useAnimateCamera(); //Importación de la función de animación de cámara.
  // Estado para controlar si el menú está abierto
  const [isOpen, setIsOpen] = useState(false);

  //Condición para verificar si los datos necesarios están listos antes de mostrar el menú
  const isDataReady =
    aortaData?.p_cent && aortaData?.n_ref &&
    Array.isArray(ostiumReferenceNodes) && ostiumReferenceNodes.length >= 2;

  /**
   * Para cada una de las vistas, se obtiene la posición de la cámara, el punto focal y la vista hacia arriba.
   * Luego, se llama a la función animateCameraToPosition para mover la cámara a esa posición.
   * @description Funciones para mover la cámara a diferentes posiciones predefinidas.
   */
  const cameraVisualizadorFrontal = () => {
    const { posicionCamara, focalPoint, viewUp } = visualizadorFrontal();
    animateCameraToPosition(posicionCamara, focalPoint, viewUp);
  }

  const cameraVisualizadorTrasero = () => {
    const { posicionCamara, focalPoint, viewUp } = visualizadorTrasero();
    animateCameraToPosition(posicionCamara, focalPoint, viewUp);
  }

  const cameraVisualizadorLateralIzquierdo = () => {
    const { posicionCamara, focalPoint, viewUp } = visualizadorLateralIzquierdo();
    animateCameraToPosition(posicionCamara, focalPoint, viewUp);
  }

  const cameraVisualizadorLateralDerecho = () => {
    const { posicionCamara, focalPoint, viewUp } = visualizadorLateralDerecho();
    animateCameraToPosition(posicionCamara, focalPoint, viewUp);
  }

  // Abre o cierra el menú al hacer clic en el botón "Vistas"
  const toggleOpen = () => setIsOpen(prev => !prev);

  // Abre el menú (hover)
  const open = () => setIsOpen(true);

  // Cierra el menú (cuando el mouse sale del área)
  const close = () => setIsOpen(false);

  return (
    <div
      className="camera-menu"
      onMouseEnter={open}  // Abre menú al pasar el ratón
      onMouseLeave={close} // Cierra menú al salir
    >
      {/* Botón principal que activa el desplegable */}
      <div onClick={toggleOpen}>
        <CustomButton text="Vistas" 
        onClick={() => { } }  
        disabled={!isDataReady }
        title={!isDataReady ? 'Vistas no disponibles' : ''}/>
      </div>

      {/* Menú desplegable que aparece si el estado está activo */}
      {isOpen && isDataReady && (
        <div className="dropdown">
          <CustomButton text="Frontal" onClick={cameraVisualizadorFrontal} />
          <CustomButton text="Lateral derecho" onClick={cameraVisualizadorLateralDerecho} />
          <CustomButton text="Trasera" onClick={cameraVisualizadorTrasero} />
          <CustomButton text="Lateral izquierdo" onClick={cameraVisualizadorLateralIzquierdo} />
        </div>
      )}
    </div>
  );
};

export default CameraControls;
