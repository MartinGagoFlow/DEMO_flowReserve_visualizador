import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import './LineChart.css'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const LineChart = forwardRef(({ data, options }, ref) => {
  const chartRef = useRef()

    // Expón la instancia del gráfico
  useImperativeHandle(ref, () => ({
    getChart: () => chartRef.current
  }));

  const updatedOptions = {
    ...options,
    animation: false,
    layout: {
      padding: 20,
    },
    plugins: {
      ...options.plugins,
    },
    scales: {
      ...options.scales,
    },
    backgroundColor: 'white',
  };

  const updatedOptions2 = {
    ...updatedOptions,
    maintainAspectRatio: false,
    responsive: true,
    devicePixelRatio: 3
  };

  return (
      <div className='chart-container'>
        <Line ref={chartRef} data={data} options={updatedOptions2}/>
      </div>
  );
});

export default LineChart;
