
import { useApp } from "../../context/AppContext";
import { useVTK } from "../../context/VTKContext";
import { useVTKLabelUtils } from "../svg/useVTKLabelUtils";
import savitzkyGolay from 'ml-savitzky-golay';
import vtkLabelWidget from '@kitware/vtk.js/Widgets/Widgets3D/LabelWidget';

export const useBuildChart = () => {

    const { createSVGRepresentationTest } = useVTKLabelUtils()
    const {setChartData, setChartOptions, setLabelsData, setIsChartVisible, isRadiusChecked, isFFRChecked} = useApp();
    const {currentLabelWidgetRef, widgetManagerRef, svgCleanupCallbacksRef, renderWindowRef} = useVTK();

    const buildChartFromResultTest = async (result, model) => {
        
        const path = Array.from(result.path);
        const pathPos = Array.from(result.positionValue);
        let baseDistance = [];
        for (let i = 1; i < pathPos.length; i++) {
            const pos = JSON.parse(pathPos[i - 1]);
            const nextPos = JSON.parse(pathPos[i]);
            baseDistance.push(Math.hypot(
                nextPos[0] - pos[0],
                nextPos[1] - pos[1],
                nextPos[2] - pos[2]
            ));
        }
        let dist = new Array(pathPos.length).fill(0);
        for (let i = 1; i < pathPos.length; i++) {
            dist[i] = dist[i - 1] + baseDistance[i - 1];
        }
        const labels = dist.map((value) => value.toFixed(1));
        const options = { windowSize: 5, polynomial: 3, pad: 'none', derivative: 0 };
        if (isFFRChecked) {
            const ffrValuesChart = savitzkyGolay(result.ffrCorrectedValues, 1, options);
            const ffrValuesSimple = ffrValuesChart.map((v) => v.toFixed(3));
            const ffrValuesLabel = ffrValuesChart.map((v) => v.toFixed(2));
            const nodes = path.map((_, index) => index);
            const riskZoneHeigth = model == "FFR" ? Array(nodes.length).fill(0.800) : Array(nodes.length).fill(0.900) //Zona de riesgo dependiendo si es FFR o iFR
            const chartDataObj = {
                labels,
                datasets: [
                    {
                        label: model + " ct",
                        fill: false,
                        lineTension: 0.1,
                        backgroundColor: 'rgba(0,0,255,0.8)',
                        borderColor: 'rgba(0,0,255,0.8)',
                        borderWidth: 2,
                        pointBorderColor: 'rgba(0,0,255,0.8)',
                        pointBackgroundColor: 'rgba(0,0,255,0.8)',
                        pointBorderWidth: 0,
                        pointHoverRadius: 2,
                        pointHoverBackgroundColor: 'rgba(0,0,255,0.8)',
                        pointHoverBorderColor: 'rgba(0,0,255,0.8)',
                        pointHoverBorderWidth: 2,
                        pointRadius: 0,
                        pointHitRadius: 10,
                        data: ffrValuesSimple
                    },
                    {
                        label: 'Zona de riesgo',
                        fill: false,
                        lineTension: 1,
                        backgroundColor: 'rgba(255, 0, 0, 1)',
                        borderColor: 'rgba(255, 0, 0, 1)',
                        borderWidth: 2,
                        pointRadius: 0,
                        pointHoverRadius: 0,
                        pointHitRadius: 0,
                        data: riskZoneHeigth,
                    },
                ],
            };
            /**
             * Crea el objeto con el chart de datos
             */

            // Calcular los valores de Y
            const minValueY = Math.min(...result.ffrCorrectedValues);
            const maxValueY = Math.max(...result.ffrCorrectedValues);
            const dataRangeY = maxValueY - minValueY;

            // Ajustar márgenes solo si el rango es mayor a 0.05
            const yMin = parseFloat((dataRangeY > 0.02 ? minValueY - 0.0075 : minValueY).toFixed(2));
            const yMax = parseFloat((dataRangeY > 0.02 ? Math.min(1, maxValueY + 0.0075) : Math.min(1, maxValueY)).toFixed(2) + 0.002);

            const chartOptionsObj = {

                scales: {
                    x: {
                        title: { display: true, text: 'Distancia (mm)' },
                        ticks: {
                            stepSize: 1,
                            autoSkip: false,
                            callback: function (value, index, values) {
                                if ((value / 2) % 5 === 0) {
                                    return value / 2;
                                } else if ((value / 2) % 1 === 0 && labels[labels.length - 1] / 2 <= 5) {
                                    return value / 2;
                                } else {
                                    return '';
                                }
                            }
                        },
                        grid: {
                            lineWidth: (ctx) => {
                                return ctx.tick.value % 5 === 0 ? 2 : 0;
                            }

                        }
                    },
                    y: {
                        title: { display: true, text: model + " ct" },

                        min: yMin, //Valor mínimo asignado redondeado a 2 decimales
                        max: yMax, // El valor máximo será el asignado por el propio modelo o 1 en caso de superarlo
                        ticks: {
                            autoSkip: false,
                            stepSize: 0.01,
                            callback: function (value, index, values) {
                                var dataRange = Math.max(...result.ffrCorrectedValues) - Math.min(...result.ffrCorrectedValues); //Rango máximo de datos extraídos
                                // Si el rango de valores maximos
                                if (dataRange >= 0.4) {
                                    if (parseInt(value * 100) % 5 === 0) {
                                        return value.toFixed(2);
                                    } else {
                                        return '';
                                    }
                                } else if (dataRange >= 0.15) {
                                    if (parseInt(value * 100) % 2 === 0) {
                                        return value.toFixed(2);
                                    } else {
                                        return '';
                                    }
                                } else {
                                    return value.toFixed(2);
                                }
                            }
                        },
                        // grid: {
                        //   lineWidth: (ctx) => (parseInt(ctx.tick.value * 100) % 2 === 0 ? 3.0 : 1.3)
                        // },
                    },
                },
                plugins: {
                    tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.raw}` } },
                    legend: { display: true },
                },
                maintainAspectRatio: false,
                responsive: true,


                /**
                 * Detecta los clicks dentro de las tablas de datos generadas tras seleccionar 2 puntos dentro de la tabla. 
                 * Usa la información del click para mostrar al usuario dentro del modelo 3D un label de información con
                 *  los datos existentes en el punto de referencia indicado por el usuario
                 * @param {*} event 
                 * @param {*} elements 
                 * @param {*} chartInstance 
                 */
                onClick: (event, elements, chartInstance) => {
                    if (elements && elements.length > 0) {
                        const index = elements[0].index;
                        const clickedPosition = JSON.parse(pathPos[index]);
                        const offset = [0, 0, 0];
                        const pushedPosition = [
                            clickedPosition[0] + offset[0],
                            clickedPosition[1] + offset[1],
                            clickedPosition[2] + offset[2]
                        ];
                        const clickedValue = ffrValuesLabel[index];
                        const distanceLabel = labels[index];
                        if (currentLabelWidgetRef.current) {
                            const widget = currentLabelWidgetRef.current;
                            widget.getWidgetState().getText().setText(
                                `${model}: ${clickedValue} \n ${distanceLabel} mm`
                            );
                            widget.getWidgetState().getText().setOrigin(pushedPosition);
                            widget.getWidgetState().modified();
                        } else {
                            const labelWidget = vtkLabelWidget.newInstance();
                            const handle = widgetManagerRef.current.addWidget(labelWidget);
                            labelWidget.getWidgetState().getText().setText(
                                `${model}: ${clickedValue} \n ${distanceLabel} mm`
                            );
                            labelWidget.getWidgetState().getText().setOrigin(pushedPosition);
                            labelWidget.getWidgetState().getText().setVisible(true);

                            svgCleanupCallbacksRef.current.set(
                                handle,

                                createSVGRepresentationTest(labelWidget, { x: 30, y: -180 }, {
                                    includeRedDot: true,
                                    redDotSize: 4,
                                    color: 'rgb(77, 24, 4)',
                                    fontSize: 16,
                                    backgroundColor: 'rgb(185, 141, 100)',
                                    fontWeight: 700
                                })
                            );
                            currentLabelWidgetRef.current = labelWidget;
                        }
                        renderWindowRef.current.render();
                    }
                }
            };

            setChartData(chartDataObj);
            setChartOptions(chartOptionsObj);
            const newLabelsData = [];
            for (let i = 0; i < pathPos.length; i++) {
                if (i % 20 === 0) {
                    // Check that pathPos, ffrValuesLabel and dist values exist.
                    if (!pathPos[i] || typeof ffrValuesLabel[i] === 'undefined' || typeof dist[i] === 'undefined') {
                        console.warn(`Skipping index ${i} due to undefined values`);
                        continue;
                    }
                    let parsedPosition;
                    try {
                        parsedPosition = JSON.parse(pathPos[i]);
                    } catch (e) {
                        console.warn(`Error parsing pathPos at index ${i}:`, e);
                        continue;
                    }
                    const labelText = `${model}: ${ffrValuesLabel[i]} \n ${dist[i].toFixed(0)} mm`;
                    newLabelsData.push({ position: parsedPosition, text: labelText });
                }
            }

            setLabelsData(newLabelsData);
            setIsChartVisible(true);
        } else if (isRadiusChecked) {
            const ffrValuesChart = savitzkyGolay(result.ffrCorrectedValues, 1, options);
            const ffrValuesSimple = ffrValuesChart.map((v) => v.toFixed(3));
            const ffrValuesLabel = ffrValuesChart.map((v) => v.toFixed(2));
            const chartDataObj = {
                labels,
                datasets: [{
                    label: 'Diametro',
                    fill: false,
                    lineTension: 0.1,
                    borderWidth: 2,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    borderColor: 'rgba(0, 0, 0, 0.8)',
                    pointBorderColor: 'rgba(0, 0, 0, 0.8)',
                    pointBackgroundColor: '#fff',
                    pointBorderWidth: 0,
                    pointHoverRadius: 2,
                    pointHoverBackgroundColor: 'rgba(0, 0, 0, 0.8)',
                    pointHoverBorderColor: 'rgba(0, 0, 0, 0.8)',
                    pointHoverBorderWidth: 0,
                    pointRadius: 0,
                    pointHitRadius: 10,
                    data: savitzkyGolay(result.diameter, 1, options)
                }],
            };
            const chartOptionsObj = {
                scales: {
                    x: {
                        title: { display: true, text: 'Distancia (mm)' },
                        ticks: {
                            stepSize: 2,
                            autoSkip: false,
                            callback: function (value, index, values) {
                                if ((value / 2) % 5 === 0) {
                                    return value / 2;
                                } else if ((value / 2) % 1 === 0 && labels[labels.length - 1] / 2 <= 5) {
                                    return value / 2;
                                } else {
                                    return '';
                                }
                            }
                        },
                        grid: {
                            lineWidth: (ctx) =>
                            ((ctx.tick.value / 2) % 1 !== 0 ? 0 : (ctx.tick.value / 2) % 5 === 0
                                ? 2.0
                                : ((labels[labels.length - 1] / 2) < 100)
                                    ? (-0.9 / 100) * (labels[labels.length - 1] / 2) + 1
                                    : 0.1)
                        }
                    },
                    y: { title: { display: true, text: 'Diametro' } },
                },
                plugins: {
                    tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${parseFloat(ctx.raw).toFixed(3)}` } },
                    legend: { display: true },
                },
                maintainAspectRatio: false,
                responsive: true,
                onClick: (event, elements, chartInstance) => {
                    if (elements && elements.length > 0) {
                        const index = elements[0].index;
                        const clickedPosition = JSON.parse(pathPos[index]);
                        const offset = [0, 0, 0];
                        const pushedPosition = [
                            clickedPosition[0] + offset[0],
                            clickedPosition[1] + offset[1],
                            clickedPosition[2] + offset[2]
                        ];
                        const clickedValue = ffrValuesLabel[index];
                        const distanceLabel = labels[index];
                        if (currentLabelWidgetRef.current) {
                            const widget = currentLabelWidgetRef.current;
                            widget.getWidgetState().getText().setText(
                                `${model}: ${clickedValue} \n ${distanceLabel} mm`
                            );
                            widget.getWidgetState().getText().setOrigin(pushedPosition);
                            widget.getWidgetState().modified();
                        } else {
                            const labelWidget = vtkLabelWidget.newInstance();
                            const handle = widgetManagerRef.current.addWidget(labelWidget);
                            labelWidget.getWidgetState().getText().setText(
                                `${model}: ${clickedValue} \n ${distanceLabel} mm`
                            );
                            labelWidget.getWidgetState().getText().setOrigin(pushedPosition);
                            labelWidget.getWidgetState().getText().setVisible(true);
                            svgCleanupCallbacksRef.current.set(
                                handle,
                                createSVGRepresentationTest(labelWidget, { x: 30, y: -120 }, {
                                    includeRedDot: true,
                                    redDotSize: 4,
                                    color: 'rgb(77, 24, 4)',
                                    fontSize: 16,
                                    backgroundColor: 'rgb(185, 141, 100)',
                                    fontWeight: 700
                                })
                            );
                            currentLabelWidgetRef.current = labelWidget;
                        }
                        renderWindowRef.current.render();
                    }
                }
            };

            setChartData(chartDataObj);
            setChartOptions(chartOptionsObj);
            const newLabelsData = [];
            for (let i = 0; i < pathPos.length; i++) {
                if (i % 20 === 0) {
                    const parsedPosition = JSON.parse(pathPos[i]);
                    const labelText = `${model}: ${ffrValuesLabel[i]} \n ${dist[i].toFixed(0)} mm`;
                    newLabelsData.push({ position: parsedPosition, text: labelText });
                }
            }
            setLabelsData(newLabelsData);
            setIsChartVisible(true);
        }
    };

    return { buildChartFromResultTest };
}