import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import ModelSelector from './pages/ModelSelector';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ModelViewer from './pages/ModelViewer';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './styles/root.css';
import { AppProvider } from './context/AppContext';
import { VTKProvider } from './context/VTKContext';


//  Raíz del proyecto desde el que se lanza la aplicación principal
const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <AppProvider>
      <VTKProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ModelSelector />} />
            <Route path="/view/:model" element={<ModelViewer />} />
          </Routes>
        </BrowserRouter>
      </VTKProvider>
    </AppProvider>
  );
} else {
  console.error("No root element found");
}
