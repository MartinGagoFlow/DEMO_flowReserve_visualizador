// src/components/FloatingPanelSwitch.js
import { useState } from 'react';
import './FloatingPanelSwitchPoints.css';
import CustomButton from '../../components/global/CustomButton';
import { useApp } from '../../context/AppContext';

const FloatingPanelSwitch = () => {
  const { isChartVisible, setIsChartVisible, chartData } = useApp()
  const [visible, setVisible] = useState(false);

  const toggleVisibility = () => setVisible(prev => !prev);

  const toggleChartVisibility = () => {
    setIsChartVisible(prev => !prev);
  }

  return (
    <div className="floating-panel">
      <CustomButton className='toggle-btn' onClick={toggleChartVisibility} disabled={!chartData} text={isChartVisible ? 'Ocultar tabla' : 'Mostrar tabla'} title={!chartData ? 'No hay datos a mostrar' : 'Alternar datos'}></CustomButton>
      

    </div>
  );
};

export default FloatingPanelSwitch;
