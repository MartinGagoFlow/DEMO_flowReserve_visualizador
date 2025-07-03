// src/hooks/useScreenshot.js

import { useVTK } from "../../context/VTKContext";


/**
 * Generador de capturas de pantalla para VTK.js
 * @description Este hook permite capturar imágenes de la ventana de renderizado de VTK.js.
 * @returns 
 */
export const useScreenshot = () => {
  const { renderWindowRef } = useVTK();

  /**
   * Realiza una captura de imagen del modelo actual y la descarga como imagen PNG.
   * @description Esta función captura la imagen actual de la ventana de renderizado y la descarga como un archivo PNG. 
   * @param {string} refCode codigo de referencia para el nombre del archivo
   * @returns {boolean} indicando si la captura fue exitosa o no.
   * @throws Error si la ventana de renderizado no está inicializada o si ocurre un error durante la captura.
   */
  const captureAndDownloadScreenshot = async (refCode, timeStamp) => {
    if (!renderWindowRef.current) {
      console.error('renderWindow no está inicializado');
      return false;
    }

    const renderWindow = renderWindowRef.current;

    renderWindow.render(); // Asegura render actualizado

    try {
      const imagePromises = renderWindow.captureImages({
        format: 'image/png',
        quality: 1,
        scale: 1,
      });

      const resolvedImages = await Promise.all(imagePromises);

      if (resolvedImages && resolvedImages.length > 0 && resolvedImages[0]) {
        const image = resolvedImages[0];

        if (!image || image.length < 100) {
          console.error('La imagen generada está vacía o corrupta');
          return false;
        }

        const link = document.createElement('a');
        link.href = image;

        const finalTimeStamp = timeStamp || Date.now();
        const finalRefCode = refCode || 'IMG';
        link.download = `${finalRefCode}-${finalTimeStamp}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        return true;
      } else {
        console.warn('No se generaron imágenes.');
        return false;
      }
    } catch (error) {
      console.error('Error al capturar imagen:', error);
      return false;
    }
  };

  /**
   * Renderiza la imagen actual de VTK.js y la descarga como PNG, incluyendo superposiciones SVG.
   * @description Esta función captura la imagen actual de la ventana de renderizado, incluyendo superposiciones SVG, y la descarga como un archivo PNG.
   * @param {string} [refCode] - Código de referencia opcional para nombrar la imagen.  
   * @returns 
   */
 const captureWithSVGOverlayAndDownload = async (refCode, timeStamp) => {
  if (!renderWindowRef.current) {
    console.error('renderWindow no está inicializado');
    return false;
  }

  const renderWindow = renderWindowRef.current;
  const canvas3D = renderWindow.getViews()[0].getCanvas();
  renderWindow.render(); // Asegura que el render esté actualizado

  const width = canvas3D.width;
  const height = canvas3D.height;

  const compositeCanvas = document.createElement('canvas');
  compositeCanvas.width = width;
  compositeCanvas.height = height;
  const ctx = compositeCanvas.getContext('2d');

  // Dibuja primero el canvas 3D
  ctx.drawImage(canvas3D, 0, 0, width, height);

  // Encuentra todos los elementos SVG visibles
  const svgElements = document.querySelectorAll('svg');

  // Dibuja cada SVG encima del canvas
  for (const svgElement of svgElements) {
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        resolve();
      };
      img.onerror = (err) => {
        console.warn("Error al cargar SVG para captura:", err);
        reject(err);
      };
      img.src = url;
    });
  }

  // Exportar imagen final como PNG
  const finalImage = compositeCanvas.toDataURL('image/png');

  const finalRefCode = refCode || 'IMG';
  const finalTimeStamp = timeStamp || Date.now();

  const link = document.createElement('a');
  link.href = finalImage;
  link.download = `${finalRefCode}-${finalTimeStamp}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return true;
};

  /**
   * Captura una imagen del render actual de VTK.js.
   * @param {string} [refCode] - Código de referencia opcional para nombrar la imagen.
   * @param {number} [timeStamp] - Marca de tiempo opcional. Si no se pasa, se genera automáticamente.
   * @returns {Promise<{ image: string, filename: string }|false>} Imagen en base64 + nombre generado o false en caso de error.
   */
  const captureScreenshot = async (refCode, timeStamp) => {
    if (!renderWindowRef.current) {
      console.error('renderWindow no está inicializado');
      return false;
    }

    const renderWindow = renderWindowRef.current;
    renderWindow.render(); // Asegura que la imagen esté actualizada

    try {
      const imagePromises = renderWindow.captureImages({
        format: 'image/png',
        quality: 1,
        scale: 1,
      });

      const resolvedImages = await Promise.all(imagePromises);

      if (resolvedImages?.[0]) {
        const image = resolvedImages[0];

        if (!image || image.length < 100) {
          console.error('La imagen generada está vacía o corrupta');
          return false;
        }

        const finalTimeStamp = timeStamp || Date.now();
        const finalRefCode = refCode || 'IMG';
        const filename = `${finalRefCode}-${finalTimeStamp}.png`;

        // En lugar de descargar directamente, se devuelve la info
        return { image, filename };
      } else {
        console.warn('No se generaron imágenes.');
        return false;
      }
    } catch (error) {
      console.error('Error al capturar imagen:', error);
      return false;
    }
  };

  /**
 * Captura la imagen actual de VTK.js con superposición SVG y la devuelve como PNG base64.
 * @param {string} [refCode] - Código de referencia opcional para nombrar la imagen.
 * @returns {Promise<{ image: string, filename: string } | false>}
 */
  const captureWithSVGOverlay = async (refCode, timeStamp) => {
    if (!renderWindowRef.current) {
      console.error('renderWindow no está inicializado');
      return false;
    }

    const renderWindow = renderWindowRef.current;
    const canvas3D = renderWindow.getViews()[0].getCanvas();
    renderWindow.render();

    const svgElement = document.querySelector('svg'); // Ajusta si usas clases específicas
    const width = canvas3D.width;
    const height = canvas3D.height;

    const compositeCanvas = document.createElement('canvas');
    compositeCanvas.width = width;
    compositeCanvas.height = height;
    const ctx = compositeCanvas.getContext('2d');

    // Dibuja el canvas 3D
    ctx.drawImage(canvas3D, 0, 0, width, height);

    // Dibuja el SVG superpuesto si existe
    if (svgElement) {
      try {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0, width, height);
            URL.revokeObjectURL(url);
            resolve();
          };
          img.onerror = (e) => {
            URL.revokeObjectURL(url);
            console.error('Error al cargar el SVG como imagen', e);
            reject(e);
          };
          img.src = url;
        });
      } catch (err) {
        console.error('Error procesando el SVG overlay:', err);
        // Continua sin el SVG
      }
    } else {
      console.warn('No se encontró SVG superpuesto');
    }

    const image = compositeCanvas.toDataURL('image/png');

    const finalTimeStamp = timeStamp || Date.now();
    const finalRefCode = refCode || 'IMG';
    const filename = `${finalRefCode}-${finalTimeStamp}.png`;

    if (!image || image.length < 100) {
      console.error('La imagen compuesta está vacía o corrupta');
      return false;
    }

    return { image, filename };
  };


    /**
 * Captura la imagen actual de VTK.js con superposición SVG y la devuelve como PNG base64.
 * @param {string} [refCode] - Código de referencia opcional para nombrar la imagen.
 * @returns {Promise<{ image: string, filename: string } | false>}
 */
  const captureWithSVGOverlayByID = async (refCode, timeStamp, idSVG) => {
    if (!renderWindowRef.current) {
      console.error('renderWindow no está inicializado');
      return false;
    }

    const renderWindow = renderWindowRef.current;
    const canvas3D = renderWindow.getViews()[0].getCanvas();
    renderWindow.render();

    const svgElement = document.getElementById(idSVG); 
    const width = canvas3D.width;
    const height = canvas3D.height;

    const compositeCanvas = document.createElement('canvas');
    compositeCanvas.width = width;
    compositeCanvas.height = height;
    const ctx = compositeCanvas.getContext('2d');

    // Dibuja el canvas 3D
    ctx.drawImage(canvas3D, 0, 0, width, height);

    // Dibuja el SVG superpuesto si existe
    if (svgElement) {
      try {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0, width, height);
            URL.revokeObjectURL(url);
            resolve();
          };
          img.onerror = (e) => {
            URL.revokeObjectURL(url);
            console.error('Error al cargar el SVG como imagen', e);
            reject(e);
          };
          img.src = url;
        });
      } catch (err) {
        console.error('Error procesando el SVG overlay:', err);
        // Continua sin el SVG
      }
    } else {
      console.warn('No se encontró SVG superpuesto');
    }

    const image = compositeCanvas.toDataURL('image/png');

    const finalTimeStamp = timeStamp || Date.now();
    const finalRefCode = refCode || 'IMG';
    const filename = `${finalRefCode}-${finalTimeStamp}.png`;

    if (!image || image.length < 100) {
      console.error('La imagen compuesta está vacía o corrupta');
      return false;
    }

    return { image, filename };
  };



  return { captureAndDownloadScreenshot, captureScreenshot, captureWithSVGOverlay, captureWithSVGOverlayAndDownload, captureWithSVGOverlayByID };
};
