import { useEffect, useRef, useState, useCallback } from 'react';
import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';
import vtkXMLPolyDataReader from '@kitware/vtk.js/IO/XML/XMLPolyDataReader';
import vtkSTLReader from '@kitware/vtk.js/IO/Geometry/STLReader';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';
import '@kitware/vtk.js/Rendering/Profiles/Geometry';
import vtkCellPicker from '@kitware/vtk.js/Rendering/Core/CellPicker.js';
import { Oval } from 'react-loader-spinner';
import vtkDataArray from '@kitware/vtk.js/Common/Core/DataArray';
import { FieldAssociations } from '@kitware/vtk.js/Common/DataModel/DataSet/Constants';
import vtkSphereSource from '@kitware/vtk.js/Filters/Sources/SphereSource';
import Graph from 'graphology';
import { parse } from 'graphology-gexf/browser';
import ChartModal from '../components/ChartModal/ChartModal.js';
import { useNavigate, useLocation } from 'react-router-dom';
import savitzkyGolay from 'ml-savitzky-golay';
import { ColorScale } from '../components/ColorScale/ColorScale.js';
import './ModelViewer.css';
import '@kitware/vtk.js/favicon';
import '@kitware/vtk.js/Rendering/Profiles/Geometry';
import '@kitware/vtk.js/Rendering/Profiles/Glyph';
import '@kitware/vtk.js/Rendering/Profiles/All';
import vtkWidgetManager from '@kitware/vtk.js/Widgets/Core/WidgetManager';
import vtkLabelWidget from '@kitware/vtk.js/Widgets/Widgets3D/LabelWidget';
import vtkInteractorObserver from '@kitware/vtk.js/Rendering/Core/InteractorObserver';
import vtkOpenGLHardwareSelector from '@kitware/vtk.js/Rendering/OpenGL/HardwareSelector.js';
import vtkVolume from '@kitware/vtk.js/Rendering/Core/Volume.js';
import vtkVolumeProperty from '@kitware/vtk.js/Rendering/Core/VolumeProperty.js';
import vtkVolumeMapper from '@kitware/vtk.js/Rendering/Core/VolumeMapper.js';
import vtkPiecewiseFunction from '@kitware/vtk.js/Common/DataModel/PiecewiseFunction.js';
import CameraControls from '../components/CameraControls/CameraControls.js';
//import vtkSphereSource from '@vtk.js/Sources/Filters/Sources/SphereSource';'
import vtkPoints from '@kitware/vtk.js/Common/Core/Points.js';
import vtkPolyData from '@kitware/vtk.js/Common/DataModel/PolyData.js';
import vtkCellArray from '@kitware/vtk.js/Common/Core/CellArray.js';
import { useApp } from '../context/AppContext.js';
import { getInnerNodes, getNodesByAttribute, getNodesInformation } from '../utils/nodes/getNodesInformation.js';
import { useVTKLabelUtils } from '../utils/svg/useVTKLabelUtils.js';
import { useAnimateCamera } from '../utils/camera/cameraUtils.js';
import { useVTK } from '../context/VTKContext.js';
import CreateReportButton from '../components/CreateReportButton/CreateReportButton.js';
import { useVTKDrawing } from '../utils/nodes/useVTKDrawing.js';
import CustomButton from '../components/global/CustomButton/CustomButton.js';
import ModelScreenshotButton from '../components/ModelScreenshotButton/ModelScreenshotButton.js';
import FloatingPanelSwitch from '../features/FloatingPanelSwitchPoints/FloatingPanelSwitchPoints.js';
import { findClosestNodeToPoint } from '../utils/nodes/getNodesInformation.js';
import { calculateShortestNodePath, calculateShortestPathTest } from '../utils/nodes/graphPathUtils.js';
import { useBuildChart } from '../utils/chart/useBuildChart.js';
import CustomCheckbox from '../components/global/CustomCheckbox/CustomCheckbox.js';
import BtnToggleOpacity from '../components/BtnToggleOpacity/BtnToggleOpacity.js';
import BtnToggleCalcium from '../components/BtnToggleCalcium/BtnToggleCalcium.js';
import { getUniqueDataAttributes } from '../utils/nodes/getNodesInformation.js';
import createSVGRepresentationsFromGraphData from '../features/ShowInformativeTags/ShowInformativeTags.js';
const { computeWorldToDisplay } = vtkInteractorObserver;


const Spinner = () => (
  <div className="spinner">
    <Oval
      height={80}
      width={80}
      color="green"
      ariaLabel="loading"
      secondaryColor="lightgrey"
      strokeWidth={2}
      strokeWidthSecondary={2}
    />
  </div>
);

const ModelViewer = (props) => {

  const { centrarImagen } = useAnimateCamera();
  const { createSingleSVGRepresentationTest, createSVGRepresentationTest } = useVTKLabelUtils()
  const { buildChartFromResultTest } = useBuildChart()
  //Inicializa variables globales para acceder desde otras partes de la aplicación:
  const { setAortaData, setOstiumReferenceNodes, isChartVisible, setIsChartVisible, chartData, setChartData, folderPath, setFolderPath,
    chartOptions, setChartOptions, labelsData, setLabelsData, isRadiusChecked, setIsRadiusChecked, isFFRChecked, setIsFFRChecked, graphPath, setViewsDictPath,
    setGraphPath, resetAppState, setModelData } = useApp();
  const { rendererRef, renderWindowRef, actorRef, widgetManagerRef, chartLabelWidgetHandlesRef, svgCleanupCallbacksRef, handleTextPropsRef } = useVTK();


  const containerRef = useRef(null);

  // VTK objects stored in refs.
  const fullScreenRendererRef = useRef(null);
  const interactorRef = useRef(null);
  //const widgetManagerRef = useRef(vtkWidgetManager.newInstance());
  const hardwareSelectorRef = useRef(null);
  const currentSphereActorRef = useRef(null);
  const currentLabelWidgetRef = useRef(null);

  // New ref for the cell picker.
  const pickerRef = useRef(null);

  // Maps for widget properties and SVG cleanup.
  //const handleTextPropsRef = useRef(new Map());
  //const svgCleanupCallbacksRef = useRef(new Map());
  const circlePropsRef = useRef(new Map());

  // Cache for parsed graph data.
  const graphDataRef = useRef(null);
  const attributeLabelWidgetRef = useRef(null);

  // State variables.
  const [actor, setActor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFlagActive, setFlagActive] = useState(false);
  const [stlActor, setStlActor] = useState(null);
  const [lastTwoClicks, setLastTwoClicks] = useState([]);
  //const [isModalOpen, setIsModalOpen] = useState(false);
  //const [chartData, setChartData] = useState({});
  //const [chartOptions, setChartOptions] = useState({});
  const [selectedComponent, setSelectedComponent] = useState('');
  const [calciumActive, setCalciumActive] = useState(false);
  const isStenosisActive = useRef(false);
  //const [isFFRChecked, setIsFFRChecked] = useState(false);
  //const [isRadiusChecked, setIsRadiusChecked] = useState(false); //Diamter tick
  const [useFilePath, setUseFilePath] = useState(true);
  const [models, setModels] = useState([]);

  const [filePath, setFilePath] = useState('');
  //const [graphPath, setGraphPath] = useState('');
  const [calciumPath, setCalciumPath] = useState('');
  //const [folderPath, setFolderPath] = useState('');
  //const [labelsData, setLabelsData] = useState([]);
  const [shortestPathResult, setShortestPathResult] = useState(null);
  const [isOpacityToggled, setIsOpacityToggled] = useState(false);

  // Ref to track chart label widget handles.
  //const chartLabelWidgetHandlesRef = useRef([]);

  
  //Labels informativas de la aplicación:
  const [labelsVisible, setLabelsVisible] = useState(true);
  const graphLabelWidgetHandlesRef = useRef([]);
  const graphSvgCleanupRef = useRef(null); // como solo creas 1 representación SVG

  const navigate = useNavigate();
  const location = useLocation();
  const { model } = location.state || {};
  setModelData(model);
  const stPath = model ? model.stPath : '';

  // For accumulating click positions.
  const [clicksAccumulated, setClicksAccumulated] = useState([]);
  const [localFileURL, setLocalFileURL] = useState(null);
  const [isStenosisListening, setIsStenosisListening] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      setLocalFileURL(fileURL);
    }
  };


  /**
   * Función que elimina una gráfica cuando el usuario quita el pop-up en el selector del menu principal
   */
  useEffect(() => {
    if (!isFFRChecked && !isRadiusChecked) {
      console.log("Checkboxes unchecked; removing current chart label");

      clearChartLabels();

      if (currentLabelWidgetRef.current) {
        const widget = currentLabelWidgetRef.current;
        widget.getWidgetState().getText().setText("");
        widget.getWidgetState().getText().setVisible(false);
        if (widgetManagerRef.current) {
          const widgets = widgetManagerRef.current.getWidgets();
          if (widgets && widgets.includes(widget)) {
            widgetManagerRef.current.removeWidget(widget);
            console.log("Widget removed from widget manager");
          }
        }
        if (svgCleanupCallbacksRef.current.has(widget)) {
          const cleanup = svgCleanupCallbacksRef.current.get(widget);
          if (typeof cleanup === "function") cleanup();
          svgCleanupCallbacksRef.current.delete(widget);
        }
        handleTextPropsRef.current.delete(widget);
        currentLabelWidgetRef.current = null;
        if (renderWindowRef.current) {
          renderWindowRef.current.render();
        }
      }
    }
  }, [isFFRChecked, isRadiusChecked]);


  /**
   * Función que elimina todas las etiquetas de gráfico y los widgets asociados.
   */
  const clearChartLabels = () => {
    chartLabelWidgetHandlesRef.current.forEach((widget) => {

      if (widgetManagerRef.current) {
        widgetManagerRef.current.removeWidget(widget);
      }

      if (svgCleanupCallbacksRef.current.has(widget)) {
        const cleanup = svgCleanupCallbacksRef.current.get(widget);
        if (typeof cleanup === 'function') {
          cleanup();
        }
        svgCleanupCallbacksRef.current.delete(widget);
      }

      handleTextPropsRef.current.delete(widget);
    });

    chartLabelWidgetHandlesRef.current = [];
  };



  useEffect(() => {
    if (actor) {
      cHandleFFR();
      // if (isFFRChecked) {
      //   cHandleFFR();
      // } else if (isRadiusChecked) {
      //   cHandleFFR(); // or call a dedicated function if needed
      // }
    }
  }, [isFFRChecked, isRadiusChecked, actor]);

  const clearRightClickLabel = () => {
    if (attributeLabelWidgetRef.current) {
      const widget = attributeLabelWidgetRef.current;
      widget.getWidgetState().getText().setVisible(false);
      const currentWidgets = widgetManagerRef.current.getWidgets();
      if (currentWidgets.includes(widget)) {
        widgetManagerRef.current.removeWidget(widget);
      }
      if (svgCleanupCallbacksRef.current.has(widget)) {
        const cleanup = svgCleanupCallbacksRef.current.get(widget);
        if (typeof cleanup === 'function') cleanup();
        svgCleanupCallbacksRef.current.delete(widget);
      }
      handleTextPropsRef.current.delete(widget);
      attributeLabelWidgetRef.current = null;
      renderWindowRef.current.render();
    }
  };

  // ********************************************************************
  // Fetch models list on mount.
  useEffect(() => {
    fetch('http://localhost:5000/api/models')
      .then((response) => response.json())
      .then((data) => setModels(data))
      .catch((error) => console.error('Error fetching models:', error));

  }, []);

  // Fetch model file paths if a model is selected.
  useEffect(() => {
    console.log("lanzando app")
    resetAppState();
    if (model) {
      console.log("modelo seleccionado: ", model)
      fetch(`http://localhost:5000/api/models/${model}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            console.error(data.error);
          } else {
            // Si se encuentra el modelo proporcionado, se cargan los paths hacia su ruta
            setFilePath(data.filePath);
            setGraphPath(data.graphPath);
            setCalciumPath(data.calciumPath);
            setFolderPath(data.fullPath);
            setAortaData(data.aortaInletData); //Almacena la información de aortaInletData en una variable global de aplicación.
            setViewsDictPath(data.viewsDict)
            console.log("data:", data)
            //Se carga tambien los datos de posición del objeto y se cargan en una variable local

          }
        })
        .catch((error) => console.error('Error fetching model files:', error));
    }
  }, [model]);

  // Cache the graph data when graphPath changes.
  useEffect(() => {
    if (graphPath) {
      console.log("fetching data")
      fetch('http://127.0.0.1:5000/api/models/' + graphPath)
        .then((res) => res.text())
        .then((gexf) => {
          graphDataRef.current = parse(Graph, gexf);

          //Una vez cargados los datos del grafo, se obtienen los datos de los nodos pertenecientes al Ostium
          const dataNodeLeft = getInnerNodes(graphDataRef, `['ostiumNodeLeft']`);
          const dataNodeRight = getInnerNodes(graphDataRef, `['ostiumNodeRight']`);

          // console.log("names: ", getUniqueDataAttributes(graphDataRef, 'names'));
          // console.log("nodos encontrados:", getNodesByAttribute(graphDataRef, 'names', `['LAD']`));
          // const LAD = getNodesByAttribute(graphDataRef, 'names', `['LAD']`);
          // const middleIndex = Math.floor(LAD.length /2);
          // const middleElement = LAD[middleIndex];
          // console.log(middleElement)
          if (labelsVisible) {
            const cleanup = createSVGRepresentationsFromGraphData(graphDataRef, createSingleSVGRepresentationTest);

            if (cleanup) {
              graphSvgCleanupRef.current = cleanup;
            }
          }


          const dataNode = [...dataNodeLeft, ...dataNodeRight];
          setOstiumReferenceNodes(dataNode); // Carga como constantes globales los datos relacionados al Ostium
          console.log("Ostium nodes data: ", dataNode);
        })
        .catch((error) => console.error("Error fetching graph data:", error));
    }
  }, [graphPath]);


  const clearGraphLabels = () => {
    if (graphSvgCleanupRef.current) {
      graphSvgCleanupRef.current();
      graphSvgCleanupRef.current = null;
      console.log("🧽 Etiquetas del grafo limpiadas");
    } else {
      console.log("⚠️ No hay etiquetas del grafo para limpiar");
    }
  };


  // 4. useEffect para manejar cambios de visibilidad
  useEffect(() => {
    console.log("cambio de efecto")
    if (graphDataRef.current) {
      clearGraphLabels();

      if (labelsVisible) {
        const cleanup = createSVGRepresentationsFromGraphData(graphDataRef, createSingleSVGRepresentationTest);
        if (cleanup) {
          graphSvgCleanupRef.current = cleanup;
        }
      }

    }
  }, [labelsVisible]);


  // ********************************************************************
  // Extract right–click logic into its own function.
  const handleRightClick = useCallback((callData, polydata, labelHandle) => {
    if (rendererRef.current !== callData.pokedRenderer) return;
    const pos = callData.position;
    const point = [pos.x, pos.y, 0.0];
    const picker = pickerRef.current;
    picker.pick(point, rendererRef.current);
    if (picker.getActors().length === 0) {
      console.log('No cells picked, default:', picker.getPickPosition());
      return;
    }
    const pickedPoints = picker.getPickedPositions();
    if (pickedPoints.length === 0) return;
    const pickedPoint = pickedPoints[0];

    // Update debugging element. codigo comentado ya que no parece funcional
    // getClickAttributes(pickedPoint).then((attributes) => {
    //   if (attributes) {
    //     document.getElementById('class').innerHTML = "Class: " + attributes.names;
    //   }
    // });

    // If neither FFR nor Diameter checkboxes are checked, show attribute label.
    if (!isFFRChecked && !isRadiusChecked) {
      getClickAttributes(pickedPoint).then((attributes) => {
        if (attributes) {
          const allowedAttributes = {
            names: 'Name',
            FFR_Corrected: model,
            WSS: 'WSS',
            HSR: 'HSR',
            CDP: 'CDP',
            velocity: 'Velocity',

          };

          let attrText = '';
          for (const key in allowedAttributes) {
            if (attributes.hasOwnProperty(key)) {
              let value = attributes[key];
              if (key === 'names' && typeof value === 'string') {
                // Procesar names para obtener el texto limpio
                value = value.replace(/['\[\]"]/g, '');
              }
              else if (typeof value === 'number') {
                value = value.toFixed(2);
              } else if (!isNaN(parseFloat(value))) {
                value = parseFloat(value).toFixed(2);
              }
              const label = key === 'FFR_Corrected' ? 'FFR' : allowedAttributes[key];
              attrText += `${label}: ${value}\n`;
            }
          }
          if (attributes.hasOwnProperty('Diameter')) {
            let value = attributes.Diameter;

            value = typeof value === 'number'
              ? value.toFixed(2)
              : parseFloat(value).toFixed(2);
            attrText += `Diameter: ${value}\n`;
          } else if (attributes.hasOwnProperty('diameter')) {
            let value = attributes.diameter;
            value = typeof value === 'number'
              ? value.toFixed(2)
              : parseFloat(value).toFixed(2);
            attrText += `Diameter: ${value}\n`;
          } else if (attributes.hasOwnProperty('radius')) {
            let value = attributes.radius * 2;
            attrText += `Diameter: ${Number(value).toFixed(2)}\n`;
          }
          const offset = [0, 0, 0];
          const elevatedPoint = [
            pickedPoint[0] + offset[0],
            pickedPoint[1] + offset[1],
            pickedPoint[2] + offset[2]
          ];
          if (attributeLabelWidgetRef.current) {
            console.log("actualizando el widget existente");
            const widget = attributeLabelWidgetRef.current;
            widget.getWidgetState().getText().setText(attrText);
            widget.getWidgetState().getText().setOrigin(elevatedPoint);
            widget.getWidgetState().modified();
          } else {
            console.log("creando un nuevo widget");
            const labelWidget = vtkLabelWidget.newInstance();
            const handle = widgetManagerRef.current.addWidget(labelWidget);
            labelWidget.getWidgetState().getText().setText(attrText);
            labelWidget.getWidgetState().getText().setOrigin(elevatedPoint);
            labelWidget.getWidgetState().getText().setVisible(true);
            handleTextPropsRef.current.set(handle, {
              fontSize: 8,
              fontColor: 'black',
              backgroundColor: 'blue'
            });

            svgCleanupCallbacksRef.current.set(
              handle,
              createSVGRepresentationTest(labelWidget, { x: 100, y: -100 })

            );
            attributeLabelWidgetRef.current = labelWidget;
          }
          renderWindowRef.current.render();
        }
      });
    }

    // If FFR or Diameter checkboxes are active, accumulate clicks.
    if (isFFRChecked || isRadiusChecked) {
      setClicksAccumulated((prev) => {
        const newClicks = [...prev, pickedPoint];
        if (newClicks.length === 2) {
          handleOpenModal(newClicks);
          return [];
        }
        return newClicks;
      });
    }

    // If stenosis is active, accumulate clicks.
    if (isStenosisActive.current) {
      setClicksAccumulated((prev) => {
        const newClicks = [...prev, pickedPoint];
        if (newClicks.length === 2) {
          calculateStenosisPercentage(newClicks[0], newClicks[1]);
          isStenosisActive.current = false;
          setIsStenosisListening(false);
          document.getElementById('btnStenosis').className = 'btn';
          return [];
        }
        return newClicks;
      });
    }

    // Process FFR and WSS arrays.
    const processArrayData = (array, name) => {
      if (array) {
        const points = polydata.getPoints().getData();
        const closestPointId = findClosestPointId(points, pickedPoint);
        if (closestPointId !== -1) {
          const data = array.getData();
          const cellValue = data[closestPointId];
          return cellValue === 9 || cellValue === -9
            ? `${name}: no value`
            : `${name}: ${cellValue.toFixed(2)}`;
        } else {
          console.error(`No closest point found for ${name}.`);
          return `${name}: Not available`;
        }
      } else {
        console.error(`Array ${name} not found.`);
        return `${name}: Not available`;
      }
    };

    const findClosestPointId = (points, refPoint) => {
      let minDist = Infinity, closestPointId = -1;
      for (let i = 0; i < points.length / 3; i++) {
        const dx = points[i * 3] - refPoint[0];
        const dy = points[i * 3 + 1] - refPoint[1];
        const dz = points[i * 3 + 2] - refPoint[2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < minDist) {
          minDist = dist;
          closestPointId = i;
        }
      }
      return closestPointId;
    };

    const wssArray = polydata.getPointData().getArrayByName('WSS');
    const ffrArray = polydata.getPointData().getArrayByName('FFR_Corrected');
    const wssValue = processArrayData(wssArray, 'WSS');
    const ffrValue = processArrayData(ffrArray, model);

    addSphereWithLabel(pickedPoint);

    const labelText = `${ffrValue} \n ${wssValue}`;
    if (isFFRChecked.checked === false) {
      labelHandle.getWidgetState().getText().setText(labelText);
      labelHandle.getWidgetState().getText().setOrigin(pickedPoint);
      labelHandle.getWidgetState().modified();
    } else {
      labelHandle.reset();
    }
  }, [model, isFFRChecked, isRadiusChecked]);




  // ********************************************************************
  // Initialize VTK scene and register right–click listener.
  useEffect(() => {
    let rightClickSubscription = null;
    if (!fullScreenRendererRef.current) {
      fullScreenRendererRef.current = vtkFullScreenRenderWindow.newInstance({
        rootContainer: containerRef.current,
      });
      rendererRef.current = fullScreenRendererRef.current.getRenderer();
      rendererRef.current.setBackground(1, 1, 1);
      renderWindowRef.current = fullScreenRendererRef.current.getRenderWindow();
      interactorRef.current = fullScreenRendererRef.current.getInteractor();
      widgetManagerRef.current.setRenderer(rendererRef.current);
      hardwareSelectorRef.current = vtkOpenGLHardwareSelector.newInstance();
      hardwareSelectorRef.current.setFieldAssociation(FieldAssociations.FIELD_ASSOCIATION_CELLS);
      hardwareSelectorRef.current.attach(renderWindowRef.current);

      window.addEventListener('unload', () => {
        if (renderWindowRef.current) {
          renderWindowRef.current.delete();
        }
      });
    } else {
      rendererRef.current = fullScreenRendererRef.current.getRenderer();
      renderWindowRef.current = fullScreenRendererRef.current.getRenderWindow();
      interactorRef.current = fullScreenRendererRef.current.getInteractor();
    }

    // Create and add a default label widget.
    const labelWidget = vtkLabelWidget.newInstance();
    const labelHandle = widgetManagerRef.current.addWidget(labelWidget);
    handleTextPropsRef.current.set(labelHandle, { fontSize: 8, fontColor: 'black', backgroundColor: 'red' });
    svgCleanupCallbacksRef.current.set(labelHandle, createSVGRepresentationTest(labelWidget));


    // Load polydata using the XML reader.
    const reader = vtkXMLPolyDataReader.newInstance();
    reader.setUrl('http://127.0.0.1:5000/api/models/' + filePath)
      .then(() => {
        reader.loadData().then(() => {
          const polydata = reader.getOutputData(0);
          if (!polydata) {
            console.error('Failed to load VTP data.');
            return;
          }
          const mapper = vtkMapper.newInstance();
          polydata.getPointData().setActiveScalars('FFR_Corrected');
          mapper.setInputData(polydata);
          const vtkActorInstance = vtkActor.newInstance();
          vtkActorInstance.setMapper(mapper);
          vtkActorInstance.getProperty().setInterpolationToFlat();
          mapper.setScalarModeToUseCellData();
          mapper.setColorModeToMapScalars();
          mapper.update();

          rendererRef.current.addActor(vtkActorInstance);
          rendererRef.current.resetCamera(vtkActorInstance.getBounds());

          renderWindowRef.current.render();


          // Setup a cell picker.
          const picker = vtkCellPicker.newInstance();
          picker.setTolerance(0.001);
          picker.setPickFromList(1);
          picker.initializePickList();
          picker.addPickList(vtkActorInstance);
          pickerRef.current = picker;

          // Register the right–click listener using the extracted function.
          rightClickSubscription = interactorRef.current.onRightButtonPress((callData) => {
            handleRightClick(callData, polydata, labelHandle);
          });

          setActor(vtkActorInstance);
          actorRef.current = vtkActorInstance; //Uso global del actor
          setIsLoading(false);
        }).catch((error) => {
          console.error('Error loading VTP data:', error);
          setIsLoading(false);
        });
        console.log("iniciando vista del modelo")
      }).catch((error) => {
        console.error('Error loading VTP file:', error);
        setIsLoading(false);
      });

    const timeoutId = setTimeout(() => setIsLoading(false), 10000);
    console.log("stpath", stPath)
    return () => {
      clearTimeout(timeoutId);
      if (rightClickSubscription && typeof rightClickSubscription.unsubscribe === 'function') {
        rightClickSubscription.unsubscribe();
      }
    };
  }, [filePath, graphPath, stPath, isFFRChecked, isRadiusChecked, handleRightClick]);

  // Adds a sphere actor at a given 3D position.
  const addSphereWithLabel = useCallback((position) => {
    const renderer = rendererRef.current;
    const renderWindow = renderWindowRef.current;
    if (currentSphereActorRef.current) {
      renderer.removeActor(currentSphereActorRef.current);
      currentSphereActorRef.current = null;
    }
    const sphereSource = vtkSphereSource.newInstance();
    sphereSource.setCenter(position);
    sphereSource.setRadius(0.5);
    const sphereMapper = vtkMapper.newInstance();
    sphereMapper.setInputConnection(sphereSource.getOutputPort());
    const sphereActor = vtkActor.newInstance();
    sphereActor.setMapper(sphereMapper);
    currentSphereActorRef.current = sphereActor;
    renderer.addActor(sphereActor);
    renderWindow.render();
  }, []);

  // Use effect to update chart label widgets when modal and labelsData change.
  // UseEffect actualizado que usa la nueva función de SVG único
  useEffect(() => {
    if (isChartVisible && labelsData.length > 0) {
      console.log("Actualizando etiquetas del gráfico");
      // Limpiar widgets anteriores
      chartLabelWidgetHandlesRef.current.forEach((widget) => {
        widgetManagerRef.current.removeWidget(widget);
        if (svgCleanupCallbacksRef.current.has(widget)) {
          const cleanup = svgCleanupCallbacksRef.current.get(widget);
          if (cleanup) cleanup();
          svgCleanupCallbacksRef.current.delete(widget);
        }
        handleTextPropsRef.current.delete(widget);
      });

      // Reiniciar el array de widgets
      chartLabelWidgetHandlesRef.current = [];

      // Verificar si hay datos de etiquetas válidos
      const validLabelsData = labelsData.filter(
        data => data && typeof data.text !== 'undefined' && typeof data.position !== 'undefined'
      );

      if (validLabelsData.length > 0) {
        // Crear una única representación SVG para todas las etiquetas
        console.log("datos labels", validLabelsData)
        const cleanupCallback = createSingleSVGRepresentationTest(
          validLabelsData,
          {
            includeRedDot: true,
            redDotSize: 5,
            backgroundColor: 'white',
            color: 'red',
            fontColor: 'black',
            redDotOffset: { x: 0, y: 0 },
            fontSize: 12,
            labelOffset: { offsetX: 100, offsetY: -50 },
            alternateOffset: true,
            showBox: true,
            fontWeight: 'normal'
          },
          "svg-pullback-data"
        );

        // Almacenar la función de limpieza para el único widget creado
        if (chartLabelWidgetHandlesRef.current.length > 0) {
          svgCleanupCallbacksRef.current.set(
            chartLabelWidgetHandlesRef.current[0],
            cleanupCallback
          );
        }
      }
    }
  }, [isChartVisible, labelsData]);

  // Checkbox change handlers.
  const handleFFRChange = (e) => {
    const checked = e.target.checked;
    setIsFFRChecked(checked);
    if (checked) {
      setIsRadiusChecked(false);
    } else {
      setIsChartVisible(false);
    }
  };

  const handleRadiusChange = (e) => {
    const checked = e.target.checked;
    setIsRadiusChecked(checked);
    if (checked) {
      setIsFFRChecked(false);
    } else {
      setIsChartVisible(false);
    }
  };

  const handleStenosisPercentage = () => {
    isStenosisActive.current = true;
    document.getElementById('btnStenosis').className = 'btn-disabled';
    setIsStenosisListening(true);
    console.log('Stenosis capture activated');
  };

  //const toggleModal = () => setIsChartVisible((prev) => !prev);
  const handlePathError = () => { /* Error handling logic */ };
  const handleCalciumError = () => { /* Error handling logic */ };

  const handleHome = () => {
    navigate('/');
  };

  // Convert a 3D point into the nearest node.
  const posToNodes = async (ref) => {
    const pointRef = ref;
    if (!graphDataRef.current) return null;
    let closestNode = null;
    let minDistance = Infinity;
    graphDataRef.current.forEachNode((node, attributes) => {
      if (attributes.pos) {
        const posNumbers = JSON.parse(attributes.pos);
        const distance = Math.sqrt(
          posNumbers.reduce((sum, value, index) => sum + Math.pow(value - pointRef[index], 2), 0)
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestNode = node;
        }
      }
    });
    if (minDistance > 5) {
      console.log('Node too far.');
      return null;
    }
    console.log("Obteniendo el nodo más cercano:", closestNode);
    return closestNode;
  };

  /**
   * Busca el nodo más cercano a un punto 3D clicado en el modelo y devuelve sus atributos.
   *
   * @async
   * @function
   * @param {number[]} ref - Coordenadas 3D del punto seleccionado, en formato [x, y, z].
   * @returns {Promise<Object|null>} Atributos del nodo más cercano si está dentro de un umbral de distancia; de lo contrario, `null`.
   *
   * Esta función itera sobre los nodos del grafo (`graphDataRef.current`) y compara su posición con el punto dado (`ref`)
   * utilizando distancia euclidiana. Devuelve los atributos del nodo más cercano que esté a una distancia menor o igual a 5 unidades.
   */
  const getClickAttributes = async (ref) => {
    const pointRef = ref; // Coordenadas [x, y, z] del clic en el modelo

    // Asegura que los datos del grafo estén disponibles
    if (!graphDataRef.current) return null;

    let closestAttributes = null;
    let minDistance = Infinity;

    // Itera sobre todos los nodos para encontrar el más cercano
    graphDataRef.current.forEachNode((node, attributes) => {
      if (attributes.pos) {
        // Convierte la posición del nodo de string a array de números
        const posNumbers = JSON.parse(attributes.pos);

        // Calcula distancia euclidiana entre el punto clicado y el nodo
        const distance = Math.sqrt(
          posNumbers.reduce(
            (sum, value, index) => sum + Math.pow(value - pointRef[index], 2),
            0
          )
        );

        // Si es la menor distancia encontrada hasta ahora, guarda el nodo
        if (distance < minDistance) {
          minDistance = distance;
          closestAttributes = attributes;
        }
      }
    });

    // Si el nodo más cercano está muy lejos, no se considera válido
    if (minDistance > 5) {
      console.log('Node too far.');
      return null;
    }

    console.log("Obteniendo atributos con un click:", closestAttributes);
    return closestAttributes;
  };


  const fetchGraphAndProcessNodes = async () => {
    const renderer = rendererRef.current;
    try {
      if (!graphDataRef.current) return;
      const possibleValues = ['LAD', 'RI', 'Cx', 'PLA', 'PDA', 'RCA'];
      possibleValues.forEach((value) => {
        const nodesForValue = [];
        graphDataRef.current.forEachNode((node, attributes) => {
          if (attributes.names === `['${value}']`) {
            const posNumbers = JSON.parse(attributes.pos);
            nodesForValue.push({ node, posNumbers });
          }
        });
        if (nodesForValue.length > 0) {
          const midIndex = Math.floor(nodesForValue.length / 2);
          const midNode = nodesForValue[midIndex];
          const labelWidget = vtkLabelWidget.newInstance();
          const handle = widgetManagerRef.current.addWidget(labelWidget);
          const widgetState = handle.getWidgetState().getText();
          widgetState.setText(`${value}`);
          widgetState.setOrigin(midNode.posNumbers);
          widgetState.setVisible(true);
          handleTextPropsRef.current.set(handle, { fontSize: 12, fontColor: 'black', backgroundColor: 'white' });
          svgCleanupCallbacksRef.current.set(handle, createSVGRepresentationTest(labelWidget));
          console.log("clicking somewhere")
        }
      });
      document.getElementById('flagDeactivate').addEventListener('click', () => {
        widgetManagerRef.current.getWidgets().forEach((widget) => {
          widget.reset();
          widgetManagerRef.current.removeWidget(widget);
          svgCleanupCallbacksRef.current.get(widget);
          svgCleanupCallbacksRef.current.delete(widget);
          handleTextPropsRef.current.delete(widget);
        });
        setFlagActive(false);
      });

    } catch (error) {
      console.error('Error loading graph:', error);
    }
  };

  const cHandleClasses = () => {
    fetchGraphAndProcessNodes();
    setFlagActive(true);
  };


  // In handleOpenModal, calculate the shortest path and cache the result.
  const handleOpenModal = async (clicks) => {
    setChartData({}); //Limpia datos chart
    setChartOptions({}); //Limpia opciones chart
    setLabelsData([]); //Limpia datos de etiquetas
    const [source, target] = clicks;
    try {
      const result = await calculateShortestPathTest(source, target, graphDataRef.current, graphPath);
      if (!result || !result.path || result.path.length === 0) {
        console.error("No valid path was returned.");
        return;
      }

      setShortestPathResult(result);
      //buildChartFromResult(result);
      buildChartFromResultTest(result, model)
    } catch (error) {
      console.error(error);
      handlePathError();
    }
  };



  // Rebuild chart whenever checkbox values or cached result change.
  useEffect(() => {
    if (shortestPathResult) {
      //buildChartFromResult(shortestPathResult);
      buildChartFromResultTest(shortestPathResult, model);
    }
  }, [isFFRChecked, isRadiusChecked, shortestPathResult]);


  const calculateStenosisPercentage = async (pos1, pos2) => {
    const sourceNode = await findClosestNodeToPoint(pos1, graphDataRef.current);
    const targetNode = await findClosestNodeToPoint(pos2, graphDataRef.current);
    const res = await fetch('http://127.0.0.1:5000/api/models/' + graphPath);
    const gexf = await res.text();
    const graph = parse(Graph, gexf);
    const nodesArr = [sourceNode, targetNode];
    const radiusValues = nodesArr.map(
      (nodeId) => parseFloat(graph.getNodeAttributes(nodeId).radius)
    );
    const sourceRadius = radiusValues[0];
    const targetRadius = radiusValues[1];
    let stenosisPercentage = 0;
    if (sourceRadius > targetRadius) {
      stenosisPercentage = (1 - targetRadius / sourceRadius) * 100;
    } else if (sourceRadius < targetRadius) {
      stenosisPercentage = (1 - sourceRadius / targetRadius) * 100;
    }
    document.getElementById("stenosis-percentage").innerHTML =
      "Stenosis: " + Math.floor(stenosisPercentage) + "%";
    return { stenosisPercentage };
  };


  const cHandleWSS = () => {
    if (!actor) return;
    const pointData = actor.getMapper().getInputData().getPointData();
    pointData.setActiveScalars('WSS');
    const scalars = pointData.getArrayByName('WSS');
    if (!scalars) return console.error('No "WSS" scalars found.');
    const mapper = actor.getMapper();
    mapper.setScalarRange([-1, 137]);
    mapper.setColorByArrayName('WSS');
    mapper.setScalarModeToUsePointData();
    const lookupTable = vtkColorTransferFunction.newInstance();
    lookupTable.addRGBPoint(137, 0.55, 0.0, 0.0);
    lookupTable.addRGBPoint(60, 0.55, 0.0, 0.0);
    lookupTable.addRGBPoint(20, 0.82, 0.41, 0.12);
    lookupTable.addRGBPoint(15, 1.0, 0.84, 0.0);
    lookupTable.addRGBPoint(14, 0.63, 0.79, 0.95);
    lookupTable.addRGBPoint(13, 0.63, 0.79, 0.95);
    lookupTable.addRGBPoint(12, 0.63, 0.79, 0.95);
    lookupTable.addRGBPoint(10, 0.39, 0.58, 0.93);
    lookupTable.addRGBPoint(8, 0.39, 0.58, 0.93);
    lookupTable.addRGBPoint(6, 0.39, 0.58, 0.93);
    lookupTable.addRGBPoint(4, 0.39, 0.58, 0.93);
    lookupTable.addRGBPoint(3, 0.0, 0.0, 0.5);
    lookupTable.addRGBPoint(2, 0.0, 0.0, 0.5);
    lookupTable.addRGBPoint(1, 0.0, 0.0, 0.75);
    lookupTable.addRGBPoint(0, 0.0, 0.0, 0.5);
    lookupTable.addRGBPoint(-1, 0.5, 0.5, 0.5);
    mapper.setLookupTable(lookupTable);
    lookupTable.setAlpha(1.0);
    mapper.modified();
    setSelectedComponent('wss');
    renderWindowRef.current.render();
  };

  const cHandleFFR = () => {
    if (!actor) return;
    renderWindowRef.current.render();
    const pointData = actor.getMapper().getInputData().getPointData();
    pointData.setActiveScalars('FFR_Corrected');
    const scalars = pointData.getArrayByName('FFR_Corrected');
    if (!scalars) return console.error('No "FFR_Corrected" scalars found.');
    const mapper = actor.getMapper();
    if (model === 'iFR') {
      mapper.setScalarRange([0.0, 9.0]);
      mapper.setColorByArrayName('FFR_Corrected');
      mapper.setScalarModeToUsePointData();
      const lookupTable = vtkColorTransferFunction.newInstance();

      // 🔴 Enfermo: rojo puro
      lookupTable.addRGBPoint(0, 1, 0.0, 0.0);
      lookupTable.addRGBPoint(0.87, 1, 0.0, 0.0);

      // 🟡 Zona de advertencia: transición a amarillo
      lookupTable.addRGBPoint(0.894, 1.0, 0.7, 0.0);  // amarillo
      lookupTable.addRGBPoint(0.90, 1.0, 0.85, 0.0);

      // 🟢 Saludable: verde puro
      lookupTable.addRGBPoint(0.919, 0.0, 1, 0.0);
      lookupTable.addRGBPoint(0.95, 0.0, 0.8, 0.0);


      // 🔵 Saludable+: azul claro
      lookupTable.addRGBPoint(0.973, 113 / 255, 157 / 255, 255 / 255);
      lookupTable.addRGBPoint(1.0, 113 / 255, 157 / 255, 255 / 255);

      // ⚪ Opcional: fuera de rango
      lookupTable.addRGBPoint(9.0, 0.5, 0.5, 0.5);

      mapper.setLookupTable(lookupTable);
      mapper.setColorModeToMapScalars();
      setSelectedComponent('ifr');
      mapper.modified();
      renderWindowRef.current.render();
    } else {
      mapper.setScalarRange([0.0, 9]);
      mapper.setColorByArrayName('FFR_Corrected');
      mapper.setScalarModeToUsePointData();
      const lookupTable = vtkColorTransferFunction.newInstance();
      // 🔴 Enfermo: rojo puro
      lookupTable.addRGBPoint(0, 1, 0.0, 0.0);
      lookupTable.addRGBPoint(0.74, 1, 0.0, 0.0);

      // 🟡 Zona de advertencia: transición a amarillo
      lookupTable.addRGBPoint(0.79, 1.0, 0.7, 0.0);  // amarillo
      lookupTable.addRGBPoint(0.80, 1.0, 0.85, 0.0);

      // 🟢 Saludable: verde puro
      lookupTable.addRGBPoint(0.84, 0.0, 1, 0.0);
      lookupTable.addRGBPoint(0.90, 0.0, 0.8, 0.0);


      // 🔵 Saludable+: azul claro
      lookupTable.addRGBPoint(0.952, 113 / 255, 157 / 255, 255 / 255);
      lookupTable.addRGBPoint(1.0, 113 / 255, 157 / 255, 255 / 255);

      // ⚪ Opcional: fuera de rango
      lookupTable.addRGBPoint(9.0, 0.5, 0.5, 0.5);

      mapper.setLookupTable(lookupTable);
      mapper.setColorModeToMapScalars();
      setSelectedComponent('ffr');
      renderWindowRef.current.render();
    }
  };

  const [nodeStart, setNodeStart] = useState('');
  const [nodeEnd, setNodeEnd] = useState('');

  const handleSubmit = async () => {
    const start = parseInt(nodeStart, 10);
    const end = parseInt(nodeEnd, 10);

    if (isNaN(start) || isNaN(end)) {
      alert('Por favor ingresa números válidos para ambos nodos.');
      return;
    }
    console.log(start, end)
    const nodeResult = await calculateShortestNodePath(start, end, graphPath)
    buildChartFromResultTest(nodeResult, model);
  };


  return (
    <div>
      <div className="clickable-area" id="clickableArea"></div>

      <FloatingPanelSwitch>
      </FloatingPanelSwitch>

      {isLoading && <Spinner />}
      {useFilePath ? (
        <div id="canvas">
          <CustomButton className="btn" onClick={handleHome} text={"Inicio"} title='Volver al inicio de la aplicación'></CustomButton>
          <button className="btn" onClick={cHandleFFR}><b>{model}</b></button>
          <button className="btn" onClick={cHandleWSS}>WSS</button>

          {/* Control de cámara del modelo 3D */}
          <CameraControls />
          <CustomButton text={"Centrar"} onClick={centrarImagen}></CustomButton>
        
          <div id="background-checkbox">
            <CustomCheckbox
              id="toggleData"
              checked={labelsVisible}
              onChange={() => setLabelsVisible(prev => !prev)}
              label="Información"
            >

            </CustomCheckbox>
            <CustomCheckbox
              id="checkbox1"
              checked={isFFRChecked}
              onChange={handleFFRChange}
              label="Pullback"
            ></CustomCheckbox>

            <CustomCheckbox
              id="btnFFRS"
              type="checkbox"
              checked={isRadiusChecked}
              onChange={handleRadiusChange}
              label="Calibre"
              title={"Activa o desactiva la función de calibre"}
            ></CustomCheckbox>
          </div>

          <BtnToggleCalcium
            calciumPath={calciumPath}
            calciumActive={calciumActive}
            setCalciumActive={setCalciumActive}
            stlActor={stlActor}
            setStlActor={setStlActor}
            rendererRef={rendererRef}
            renderWindowRef={renderWindowRef}
          />
          <BtnToggleOpacity actor={actor} renderWindowRef={renderWindowRef}></BtnToggleOpacity>
          <CustomButton onClick={clearRightClickLabel} text={"Limpiar etiquetas"}></CustomButton>

          {/* <h5>{model} - {folderPath}</h5> */}

          <div id="gradient-container">
            {selectedComponent && <ColorScale colors={selectedComponent} />}

          </div>
          {isChartVisible && chartData?.datasets?.length > 0 && (
            <ChartModal
              isOpen={true}
              data={chartData}
              options={chartOptions}
              ariaHideApp={false}
              id="chart-modal"
            />
          )}


        </div>
      ) : (
        <div id="canvas">
          <button className="btn" onClick={() => setUseFilePath((prev) => !prev)}>
            {useFilePath ? "Stream lines" : "Back"}
          </button>
          <ChartModal
            isOpen={isChartVisible && chartData}
            data={chartData}
            options={chartOptions}
            ariaHideApp={false}
            id="chart-modal"
          ></ChartModal>
          <br />
        </div>
      )}
      <div id="containerRef" ref={containerRef} style={{ width: '100vw', height: '90vh', zIndex: 1 }}></div>
      <div id="logo" style={{ position: 'absolute', bottom: '10px', left: '10px', zIndex: 1 }}>
        <img src="../img/flowreserve-logo-500.png" alt="Logo" />
      </div>
    </div>
  );
};

export default ModelViewer;
