import { useRef } from 'react';
import JSZip, { folder } from 'jszip';
import { saveAs } from 'file-saver';
import { useScreenshot } from '../images/useScreenShot';
import { useAnimateCamera } from '../camera/cameraUtils';
import { CORONARY_VIEW_LABELS } from '../../config/viewLabels';
import { useApp } from '../../context/AppContext';
import { getIDPatient } from '../global/getIDPatient';
import { useVTK } from '../../context/VTKContext';
import { calculateShortestNodePath } from '../nodes/graphPathUtils';
import { useBuildChart } from '../chart/useBuildChart';
import useCameraViews from '../camera/moveCameraUtils';


export const useInforme = () => {
  const { folderPath, graphPath, modelData, chartCanvasRef, viewsDictPath } = useApp();
  //const { graphDataRef } = useVTK();
  const { captureScreenshot, captureWithSVGOverlay, captureWithSVGOverlayByID } = useScreenshot();
  const { moveCameraInstantlyToPosition, moveCameraInstantlyToPositionCenteredBound } = useAnimateCamera();
  const { visualizadorFrontal, visualizadorLateralDerecho } = useCameraViews()
  const { buildChartFromResultTest } = useBuildChart();


  /**
   * Genera un informe básico en formato ZIP con capturas de pantalla del modelo.
   * @description Esta función captura imágenes de diferentes vistas del modelo y las empaqueta en un archivo ZIP.
   */
  const generarInformeBasico = async () => {
    const zip = new JSZip();
    const idPatient = getIDPatient(folderPath);
    const timeStamp = Date.now();

    const folderName = `${idPatient}_informe-${timeStamp}`;
    const mainFolder = zip.folder(folderName);

    zip.file(`${folderName}.txt`, idPatient);
    const esperar = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    try {
      console.log("Cargando viewsDict");

      const fileName = `http://127.0.0.1:5000/api/models/${viewsDictPath}`;
      const response = await fetch(fileName);
      const coronaryViews = await response.json();

      console.log("vistas coronarias: ", coronaryViews)

      const aortaKeys = ['aortaFrontal', 'aortaPosterior', 'aortaLeft', 'aortaRight'];

      const frontalFolder = mainFolder.folder("Aorta_Frontal")
      const vistaFrontal = visualizadorFrontal();
      await moveCameraInstantlyToPositionCenteredBound(vistaFrontal.posicionCamara, vistaFrontal.focalPoint, vistaFrontal.viewUp);
      const frontalScreenshot = await captureWithSVGOverlayByID(`${idPatient}_Aorta_Frontal`, timeStamp, "label-aorta-data");

      if (frontalScreenshot) {
        frontalFolder.file(frontalScreenshot.filename, frontalScreenshot.image.split(',')[1], { base64: true });
      }


      const rightFolder = mainFolder.folder("Aorta_Derecha")
      const vistaLateral = visualizadorLateralDerecho();
      await moveCameraInstantlyToPositionCenteredBound(vistaLateral.posicionCamara, vistaFrontal.focalPoint, vistaFrontal.viewUp);
      const rightScreenshot = await captureWithSVGOverlayByID(`${idPatient}_Aorta_Derecha`, timeStamp, "label-aorta-data");

      if (rightScreenshot) {
        rightFolder.file(rightScreenshot.filename, rightScreenshot.image.split(',')[1], { base64: true });
      }


      for (const key in coronaryViews) {
        const view = coronaryViews[key];
        if (!view.cameraPosition || !view.focalPoint || !view.viewUp) continue;

        const cameraPosition = Array.isArray(view.cameraPosition[0])
          ? view.cameraPosition[0]
          : view.cameraPosition;




        if (!aortaKeys.includes(key)) {

          const label = CORONARY_VIEW_LABELS[key] || key;
          const viewFolder = mainFolder.folder(label); // carpeta propia para esta vista

          // 1. Generar path y chart
          const result = await calculateShortestNodePath(view.firstPathNode, view.lastPathNode, graphPath);
          await buildChartFromResultTest(result, modelData);

          // 2. Captura normal
          await moveCameraInstantlyToPosition(cameraPosition, view.focalPoint, view.viewUp);
          await esperar(100);
          const screenshot = await captureWithSVGOverlayByID(`${idPatient}_${label}_detailed`, timeStamp, 'svg-pullback-data');
          if (screenshot) {
            viewFolder.file(screenshot.filename, screenshot.image.split(',')[1], { base64: true });
          }

          await esperar(100);
          // 3. Captura centrada
          await moveCameraInstantlyToPositionCenteredBound(cameraPosition, view.focalPoint, view.viewUp);
          const screenshotCentered = await captureWithSVGOverlay(`${idPatient}_${label}_global`, timeStamp);
          if (screenshotCentered) {
            viewFolder.file(screenshotCentered.filename, screenshotCentered.image.split(',')[1], { base64: true });
          }

          // 4. Captura del chart desde el canvas
          
          console.log("chartCanvasRef", chartCanvasRef.current)
          const chartInstance = chartCanvasRef.current?.getChart();

          if (chartInstance) {
            const base64 = chartInstance.toBase64Image(); // o toBlob()
            const base64Data = base64.split(',')[1]; // quitar encabezado
            viewFolder.file(`${idPatient}_${label}_chart-${timeStamp}.png`, base64Data, { base64: true });
          } else {
            console.warn("No se encontró canvas del gráfico para ", label);
          }
        }
      }

    } catch (error) {
      console.error("Error al cargar datos:", error);
    }

    const filename = `${folderName}.zip`;
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, filename);
  };




  return { generarInformeBasico };
};
