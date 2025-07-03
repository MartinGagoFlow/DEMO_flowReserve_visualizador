// src/hooks/useCameraViews.js

import { useApp } from '../../context/AppContext';
import vtkMath from 'vtk.js/Sources/Common/Core/Math';

import {
  calcularVectorDireccion,
  calcularNorma2Vector,
  obtenerInverso,
  multiplicarVector,
  restarVector,
  sumarVector,
} from '../../components/CameraControls/utils/getReferencePoints';

const useCameraViews = () => {
    //Obtiene datos relativos al modelo 3D y los nodos de referencia de la aorta desde el contexto de la aplicación.
  const { aortaData, ostiumReferenceNodes } = useApp(); 
  
  //Parametros base para obtener las distintas posciones de la cámara
  const baseParams = () => {
    const focalPoint = aortaData.p_cent;
    const viewUp = obtenerInverso(aortaData.n_ref);
    if(ostiumReferenceNodes.length < 2){
      console.error('No hay suficientes nodos de referencia para calcular la dirección de la cámara.');
      return;
    }
    const norma = calcularNorma2Vector(
      ostiumReferenceNodes[0].posNumbers,
      ostiumReferenceNodes[1].posNumbers
    );
    const vectorDireccion = calcularVectorDireccion(
      ostiumReferenceNodes[0].posNumbers,
      ostiumReferenceNodes[1].posNumbers
    );

    const vectorDireccionCamara = [];
    vtkMath.cross(vectorDireccion, viewUp, vectorDireccionCamara);

    return {
      focalPoint,
      viewUp,
      norma,
      vectorDireccion,
      vectorDireccionCamara,
    };
  };

  // funcion para obtener la vista frontal, trasera y lateral de la cámara
  const visualizadorFrontal = () => {
    const { focalPoint, viewUp, norma, vectorDireccionCamara } = baseParams();
    const posicionCamara = sumarVector(
      focalPoint,
      multiplicarVector(vectorDireccionCamara, norma * 10)
    );
    return { posicionCamara, focalPoint, viewUp };
  };

  const visualizadorTrasero = () => {
    const { focalPoint, viewUp, norma, vectorDireccionCamara } = baseParams();
    const posicionCamara = restarVector(
      focalPoint,
      multiplicarVector(vectorDireccionCamara, norma * 10)
    );
    return { posicionCamara, focalPoint, viewUp };
  };

  const visualizadorLateralIzquierdo = () => {
    const { focalPoint, viewUp, norma, vectorDireccion } = baseParams();
    const posicionCamara = sumarVector(
      focalPoint,
      multiplicarVector(vectorDireccion, norma * 10)
    );
    return { posicionCamara, focalPoint, viewUp };
  };

  const visualizadorLateralDerecho = () => {
    const { focalPoint, viewUp, norma, vectorDireccion } = baseParams();
    const posicionCamara = restarVector(
      focalPoint,
      multiplicarVector(vectorDireccion, norma * 10)
    );
    return { posicionCamara, focalPoint, viewUp };
  };

  return {
    visualizadorFrontal,
    visualizadorTrasero,
    visualizadorLateralIzquierdo,
    visualizadorLateralDerecho,
  };
};

export default useCameraViews;
