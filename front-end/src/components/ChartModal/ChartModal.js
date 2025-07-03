import React, { useState, useRef, useEffect } from 'react';
import Modal from 'react-modal';
import LineChart from '../Chart/LineChart';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import './ChartModal.css';
import { useScreenshot } from '../../utils/images/useScreenShot';
import CustomButton from '../global/CustomButton';
import { useApp } from '../../context/AppContext';
import { getIDPatient } from '../../utils/global/getIDPatient';

const ChartModal = ({ data, options, children }) => {

  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });

  const { captureWithSVGOverlay } = useScreenshot()
  const { isChartVisible, setIsChartVisible, chartCanvasRef, folderPath } = useApp();

  const exportBothImages = async () => {

    const chartInstance = chartCanvasRef.current?.getChart();

    const idPatient = getIDPatient(folderPath);
    const timeStamp = Date.now();
    const fileName = `${idPatient}_export-${timeStamp}`;

    if (!chartInstance) {
      console.error("No se encontró el chartInstance del gráfico.");
      return;
    }
    // 1. Captura la imagen del modelo 3D
    const modelImageData = await captureWithSVGOverlay(`${idPatient}_IMG`, timeStamp);
    if (!modelImageData) return;

    try {
      const zip = new JSZip();

      // Imagen del modelo 3D
      const modelBlob = await fetch(modelImageData.image).then(res => res.blob());
      zip.file(modelImageData.filename, modelBlob);

      // Imagen del gráfico en base64
      const base64 = chartInstance.toBase64Image(); 
      const base64Data = base64.split(',')[1]; 
      zip.file(`${idPatient}_IMG_chart-${timeStamp}.png`, base64Data, { base64: true });

      zip.file(`${fileName}.txt`, idPatient);
      // Descargar ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `${fileName}.zip`);
    } catch (err) {
      console.error("Error generando el ZIP:", err);
    }
  };



  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartPosition({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - startPosition.x,
        y: e.clientY - startPosition.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <Modal
      isOpen={isChartVisible}
      // onRequestClose={() => setIsChartVisible(false)}
      contentLabel="Line Chart Modal"
      className="ReactModal__Content"
      overlayClassName="ReactModal__Overlay"
      ariaHideApp={false}>


      <div
        className="draggable-modal-content"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={handleMouseDown}>
          <button className='close-btn' onClick={() => setIsChartVisible(false)} title='Cerrar ventana' aria-label='Cerrar ventana'>
            <img className='icon-btn' src="/icons/xmark-solid.svg" alt="Close" />
          </button>
        <div>
          
        </div>
        <LineChart ref={chartCanvasRef} data={data} options={options} />

        {children}
      </div>
    </Modal>
  );
};

export default ChartModal;
