import { createContext, useContext, useRef } from 'react';
import vtkWidgetManager from '@kitware/vtk.js/Widgets/Core/WidgetManager';

// Crear el contexto
const VTKContext = createContext();

// Proveedor del contexto
export const VTKProvider = ({ children }) => {
    // Refs principales de VTK
    const containerRef = useRef(null); //No se usa en el código, pero se deja para referencia futura
    const fullScreenRendererRef = useRef(null);
    const rendererRef = useRef(null);
    const renderWindowRef = useRef(null);
    const actorRef = useRef(null);
    const interactorRef = useRef(null);
    const widgetManagerRef = useRef(vtkWidgetManager.newInstance());
    const hardwareSelectorRef = useRef(null);
    const currentSphereActorRef = useRef(null);
    const currentLabelWidgetRef = useRef(null);
    const graphDataRef = useRef(null); // Se añadió para almacenar los datos del grafo

    const chartLabelWidgetHandlesRef = useRef([]);
    const svgCleanupCallbacksRef = useRef(new Map());
    const handleTextPropsRef = useRef(new Map());

    return (
        <VTKContext.Provider
            value={{
                containerRef,
                fullScreenRendererRef,
                rendererRef,
                renderWindowRef,
                actorRef,
                interactorRef,
                widgetManagerRef,
                hardwareSelectorRef,
                currentSphereActorRef,
                currentLabelWidgetRef,
                graphDataRef,
                chartLabelWidgetHandlesRef,
                svgCleanupCallbacksRef,
                handleTextPropsRef
            }}
        >
            {children}
        </VTKContext.Provider>
    );
};

// Hook personalizado
export const  useVTK = () => useContext(VTKContext);
