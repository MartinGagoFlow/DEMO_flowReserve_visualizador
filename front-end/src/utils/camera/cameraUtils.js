// src/utils/camera/animateCameraToPosition.js
import { useVTK } from '../../context/VTKContext';

/**
 * Hook que devuelve una función para animar la cámara usando refs globales desde el contexto VTK.
 */
export const useAnimateCamera = () => {
  const { rendererRef, renderWindowRef, actorRef } = useVTK();

  /**
   * Anima la camra a una posición, punto focal y vista específicos.
   * @param {*} targetPosition 
   * @param {*} targetFocalPoint 
   * @param {*} targetViewUp 
   * @param {*} duration 
   */
  const animateCameraToPosition = (
    targetPosition,
    targetFocalPoint,
    targetViewUp,
    duration = 1000
  ) => {
    const camera = rendererRef.current.getActiveCamera();
    const renderWindow = renderWindowRef.current;

    const startTime = performance.now();

    const startPosition = camera.getPosition();
    const startFocalPoint = camera.getFocalPoint();
    const startViewUp = camera.getViewUp();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const t = Math.min(elapsed / duration, 1);

      const lerp = (start, end) => start + (end - start) * t;

      const interpolatedPosition = startPosition.map((v, i) =>
        lerp(v, targetPosition[i])
      );
      const interpolatedFocal = startFocalPoint.map((v, i) =>
        lerp(v, targetFocalPoint[i])
      );
      const interpolatedViewUp = startViewUp.map((v, i) =>
        lerp(v, targetViewUp[i])
      );

      camera.setPosition(...interpolatedPosition);
      camera.setFocalPoint(...interpolatedFocal);
      camera.setViewUp(...interpolatedViewUp);

      rendererRef.current.resetCameraClippingRange();
      renderWindow.render();

      if (t < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };


  /**
 * Mueve instantáneamente la cámara a una posición, punto focal y vista específicos.
 * @param {number[]} targetPosition - Nueva posición de la cámara [x, y, z]
 * @param {number[]} targetFocalPoint - Nuevo punto focal [x, y, z]
 * @param {number[]} targetViewUp - Nuevo vector viewUp [x, y, z]
 */
  const moveCameraInstantlyToPosition = (
    targetPosition,
    targetFocalPoint,
    targetViewUp
  ) => {
    return new Promise((resolve) => {
      const camera = rendererRef.current.getActiveCamera();
      const renderWindow = renderWindowRef.current;

      camera.setPosition(...targetPosition);
      camera.setFocalPoint(...targetFocalPoint);
      camera.setViewUp(...targetViewUp);
      
      rendererRef.current.resetCameraClippingRange();
      renderWindow.render();
      setTimeout(() => {
        resolve();
      }, 0); // Resolviendo la promesa inmediatamente
    });
  };


  /**
 * Mueve instantáneamente la cámara a una posición, punto focal y vista específicos.
 * @param {number[]} targetPosition - Nueva posición de la cámara [x, y, z]
 * @param {number[]} targetFocalPoint - Nuevo punto focal [x, y, z]
 * @param {number[]} targetViewUp - Nuevo vector viewUp [x, y, z]
 */
  const moveCameraInstantlyToPositionCenteredBound = (
    targetPosition,
    targetFocalPoint,
    targetViewUp
  ) => {
    return new Promise((resolve) => {
      const camera = rendererRef.current.getActiveCamera();
      const renderWindow = renderWindowRef.current;

      camera.setPosition(...targetPosition);
      camera.setFocalPoint(...targetFocalPoint);
      camera.setViewUp(...targetViewUp);

      const bounds = actorRef.current.getBounds();
      
      rendererRef.current.resetCamera(bounds);
      renderWindow.render();
      setTimeout(() => {
        resolve();
      }, 0); // Resolviendo la promesa inmediatamente
    });
  };

  /**
   * Centrar la imagen actual en la vista.
   * @description Esta función ajusta la cámara para que se centre en el actor actual.
   */
  const centrarImagen = () => {

    const bounds = actorRef.current.getBounds();
    console.log(bounds)
    rendererRef.current.resetCamera(bounds);
    renderWindowRef.current.render();
  }


  const getCurrentView = () => {
    const camera = rendererRef.current.getActiveCamera();
    console.log('Estado actual de la vista:');
    console.log('position:', camera.getPosition());
    console.log('focalPoint:', camera.getFocalPoint());
    console.log('viewUp:', camera.getViewUp());
  }

  return { animateCameraToPosition, moveCameraInstantlyToPosition, getCurrentView, moveCameraInstantlyToPositionCenteredBound, centrarImagen };
};




