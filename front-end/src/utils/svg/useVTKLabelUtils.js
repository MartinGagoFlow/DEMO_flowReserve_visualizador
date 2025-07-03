import { init, classModule, propsModule, styleModule, eventListenersModule, h, attributesModule } from 'snabbdom';
import { useVTK } from '../../context/VTKContext';
import vtkLabelWidget from '@kitware/vtk.js/Widgets/Widgets3D/LabelWidget';
import vtkInteractorObserver from '@kitware/vtk.js/Rendering/Core/InteractorObserver';
const { computeWorldToDisplay } = vtkInteractorObserver;

export const useVTKLabelUtils = () => {

  const { rendererRef, widgetManagerRef, chartLabelWidgetHandlesRef, handleTextPropsRef } = useVTK();


  /**
   * Función que crea un unico widget SVG para representar etiquetas en un gráfico.
   * @param {*} allLabelsData elementos de datos de etiquetas, cada uno con propiedades de texto y posición.
   * @param {*} options ajustes de visualización, incluyendo color de fondo, color de texto, tamaño de fuente, etc.
   * @returns 
   */
  const createSingleSVGRepresentationTest = (
    allLabelsData,
    options = {
      includeRedDot: true,
      redDotSize: 5,
      backgroundColor: 'white',
      color: 'red',
      fontColor: 'black',
      redDotOffset: { x: 0, y: 0 },
      labelOffset: { offsetX: 100, offsetY: -50 }, // Corregido: era 'offSetY'
      alternateOffset: true,
      showBox: true,
      fontSize: 12,
      fontWeight: 'normal'
    },
    containerId = 'custom-label-svg'
  ) => {
    console.log("creando SVG:", allLabelsData)
    // Crear un único widget para todas las etiquetas
    const dummyWidget = vtkLabelWidget.newInstance();
    const labelHandle = widgetManagerRef.current.addWidget(dummyWidget);

    // Guardar la referencia para limpieza posterior
    chartLabelWidgetHandlesRef.current.push(labelHandle);

    return bindSVGRepresentation(containerId, rendererRef, dummyWidget.getWidgetState(), {
      mapState(widgetState, { size }) {
        // Procesar todos los datos de etiquetas
        return allLabelsData
          .filter(data => data && typeof data.text !== 'undefined' && typeof data.position !== 'undefined')
          .map((data, index) => {
            const origin = data.position;
            const text = data.text;

            // Calcular posición en pantalla para cada etiqueta
            if (origin) {
              const coords = computeWorldToDisplay(rendererRef.current, ...origin);

              // Calcular offset basado en las opciones
              let offsetX, offsetY;

              if (options.alternateOffset) {
                offsetX = index % 2 === 0 ? options.labelOffset.offsetX : -options.labelOffset.offsetX;
              } else {
                offsetX = options.labelOffset.offsetX;
              }

              offsetY = options.labelOffset.offsetY; // Esta línea faltaba

              const position = [
                coords[0] + offsetX,
                size[1] - coords[1] + offsetY
              ];

              return {
                text,
                position,
                origin2D: [coords[0], size[1] - coords[1]],
                active: true,
                index // Incluir índice para identificación única
              };
            }
            return null;
          })
          .filter(item => item !== null); // Filtrar elementos nulos
      },
      render(allData, h) {
        if (!allData || allData.length === 0) return [];

        const allNodes = [];

        // Agregar filtro de sombra (solo una vez)
        allNodes.push(
          h('filter', {
            key: 'drop-shadow-filter',
            attrs: {
              id: 'label-shadow'
            }
          }, [
            h('feDropShadow', {
              attrs: {
                dx: 1,
                dy: 1,
                stdDeviation: 2,
                floodColor: 'black',
                floodOpacity: 0.4
              }
            })
          ])
        );

        // Procesar cada etiqueta
        allData.forEach(data => {
          const { fontColor, fontSize, backgroundColor } = options;

          const lines = data.text.split('\n');
          const dys = multiLineTextCalculator(lines.length, fontSize, VerticalTextAlignment.MIDDLE);
          const textWidth = Math.max(...lines.map((line) => line.length)) * fontSize * 0.6;
          const textHeight = fontSize * lines.length;

          // Línea negra desde el punto original a la etiqueta
          allNodes.push(
            h('line', {
              key: `connector-line-${data.index}`,
              attrs: {
                x1: data.origin2D[0],
                y1: data.origin2D[1],
                x2: data.position[0],
                y2: data.position[1] + textHeight / 2 + 5,
                stroke: 'black',
                'stroke-width': 1.5
              }
            })
          );

          // Fondo con borde y sombra (solo si showBox es true)
          if (options.showBox) {
            allNodes.push(
              h('rect', {
                key: `background-${data.index}`,
                attrs: {
                  x: data.position[0] - textWidth / 2 - 4,
                  y: data.position[1] - textHeight / 2 - 2,
                  width: textWidth + 8,
                  height: textHeight + 8,
                  fill: backgroundColor,
                  opacity: 0.8,
                  stroke: 'black',
                  'stroke-width': 1,
                  rx: 5,
                  ry: 5,
                  filter: 'url(#label-shadow)'
                }
              })
            );
          }

          // Texto multilínea
          lines.forEach((line, lineIndex) => {
            allNodes.push(
              h(
                'text',
                {
                  key: `text-${data.index}-${lineIndex}`,
                  attrs: {
                    x: data.position[0],
                    y: data.position[1],
                    dx: 0,
                    dy: dys[lineIndex],
                    fill: fontColor,
                    'font-size': fontSize,
                    'font-weight': options.fontWeight,
                    'text-anchor': 'middle'
                  }
                },
                line
              )
            );
          });

          // Punto rojo opcional
          if (options.includeRedDot) {
            allNodes.push(
              h('circle', {
                key: `red-point-${data.index}`,
                attrs: {
                  r: options.redDotSize,
                  fill: options.color,
                  cx: data.origin2D[0] + (options.redDotOffset?.x || 0),
                  cy: data.origin2D[1] + (options.redDotOffset?.y || 0),
                  stroke: 'white',
                  'stroke-width': 1
                }
              })
            );
          }
        });

        return allNodes;
      }
    });
  };

  const createSVGRepresentationTest = (
    viewWidget,
    offset = { x: 0, y: 0 },
    options = {
      includeRedDot: true,
      redDotSize: 5,
      backgroundColor: 'white',
      color: 'red',
      fontColor: 'black',
      redDotOffset: { x: 0, y: 0 },
      fontSize: 12,
      fontWeight: 'normal'
    }
  ) => {
    return bindSVGRepresentation(Date.now(), rendererRef, viewWidget.getWidgetState(), {
      mapState(widgetState, { size }) {
        const textState = widgetState.getText();
        const text = textState.getText();
        const origin = textState.getOrigin();

        if (origin && textState.getVisible()) {
          const coords = computeWorldToDisplay(rendererRef.current, ...origin);
          const position = [
            coords[0] + offset.x,
            size[1] - coords[1] + offset.y
          ];
          return {
            text,
            position,
            origin2D: [coords[0], size[1] - coords[1]], // Para dibujar la línea
            active: textState.getActive()
          };
        }
        return null;
      },
      render(data, h) {
        if (data) {
          const nodes = [];
          const { fontColor, fontSize, backgroundColor } =
            handleTextPropsRef.current.get(viewWidget) || {
              fontColor: options.fontColor,
              fontSize: options.fontSize,
              backgroundColor: options.backgroundColor
            };

          const lines = data.text.split('\n');
          const dys = multiLineTextCalculator(lines.length, fontSize, VerticalTextAlignment.MIDDLE);
          const textWidth = Math.max(...lines.map((line) => line.length)) * fontSize * 0.6;
          const textHeight = fontSize * lines.length;

          // Línea negra desde el punto original a la etiqueta
          nodes.push(
            h('line', {
              key: 'connector-line',
              attrs: {
                x1: data.origin2D[0],
                y1: data.origin2D[1],
                x2: data.position[0],
                y2: data.position[1] + textHeight / 2 + 5,
                stroke: 'black',
                'stroke-width': 1.5
              }
            })
          );

          // Filtro para sombra SVG
          nodes.push(
            h('filter', {
              key: 'drop-shadow-filter',
              attrs: {
                id: 'label-shadow'
              }
            }, [
              h('feDropShadow', {
                attrs: {
                  dx: 1,
                  dy: 1,
                  stdDeviation: 2,
                  floodColor: 'black',
                  floodOpacity: 0.4
                }
              })
            ])
          );

          // Fondo con borde y sombra
          nodes.push(
            h('rect', {
              key: 'background',
              attrs: {
                x: data.position[0] - textWidth / 2 - 4,
                y: data.position[1] - textHeight / 2 - 2,
                width: textWidth + 8,
                height: textHeight + 8,
                fill: backgroundColor,
                opacity: 0.8,
                stroke: 'black',              // Borde negro
                'stroke-width': 1,            // Grosor del borde
                rx: 5,
                ry: 5,
                filter: 'url(#label-shadow)'  // Aplicación de la sombra
              }
            })
          );

          // Texto multilínea
          nodes.push(
            ...lines.map((line, index) =>
              h(
                'text',
                {
                  key: index,
                  attrs: {
                    x: data.position[0],
                    y: data.position[1],
                    dx: 0,
                    dy: dys[index],
                    fill: fontColor,
                    'font-size': fontSize,
                    'font-weight': options.fontWeight,
                    'text-anchor': 'middle'
                  }
                },
                line
              )
            )
          );

          // Punto rojo opcional
          if (options.includeRedDot) {
            nodes.push(
              h('circle', {
                key: 'red-point',
                attrs: {
                  r: options.redDotSize,
                  fill: options.color,
                  cx: data.origin2D[0] + (options.redDotOffset?.x || 0),
                  cy: data.origin2D[1] + (options.redDotOffset?.y || 0),
                  stroke: 'white',
                  'stroke-width': 1
                }
              })
            );
          }

          return nodes;
        }
        return [];
      }
    });
  };



  /**
   * Automatically updates an SVG rendering whenever a widget's state is updated.
   *
   * This update is done in two phases:
   * 1. mapState(widgetState) takes the widget state and transforms it into an intermediate data representation.
   * 2. render(data, h) takes the intermediate data representation and a createElement `h` function, and returns
   *    an SVG rendering of the state encoded in `data`.
   *
   * See snabbdom's documentation for how to use the `h` function passed to `render()`.
   *
   * @param renderer the widget manager's renderer
   * @param widgetState the widget state
   * @param mapState (object parameter) transforms the given widget's state into an intermediate data representation to be passed to render().
   * @param render (object parameter) returns the SVG representation given the data from mapState() and snabbdom's h render function.
   */
  function bindSVGRepresentation(
    idSVG,
    renderer,
    widgetState,
    { mapState, render }
  ) {
    const view = renderer.current.getRenderWindow().getViews()[0];
    const canvas = view.getCanvas();

    const getSize = () => {
      const [width, height] = view.getSize();
      const ratio = window.devicePixelRatio || 1;
      return {
        id: idSVG,
        width: width / ratio,
        height: height / ratio,
        viewBox: `0 0 ${width} ${height}`,
      };
    };

    const styleNode = h('style', {}, `
  text {
    font-family: 'Segoe UI', sans-serif;
  }
`);


    const renderState = (state) => {
      const repData = mapState(state, {
        size: view.getSize(),
      });
      const rendered = render(repData, h);
      return h(
        'svg',
        {
          attrs: getSize(),
          style: {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            'pointer-events': 'none',
          },
        },
        [styleNode, ...(Array.isArray(rendered) ? rendered : [rendered])]
      );
    };

    const dummy = mountDummySVGContainer(canvas);
    //console.log("dummy", dummy)
    let vnode = patch(dummy, renderState(widgetState));

    const updateVNode = () => {
      vnode = patch(vnode, renderState(widgetState));
    };

    const stateSub = widgetState.onModified(() => updateVNode());
    const cameraSub = renderer.current.getActiveCamera().onModified(() => updateVNode());
    const observer = new ResizeObserver(() => updateVNode());
    observer.observe(canvas);

    return () => {
      stateSub.unsubscribe();
      cameraSub.unsubscribe();
      observer.disconnect();
      patch(vnode, h('!')); // unmount hack
      vnode = null;
    };
  }

  function mountDummySVGContainer(canvas) {
    const container = canvas.parentElement;

    const dummy = document.createElement('div');
    container.insertBefore(dummy, canvas.nextSibling);

    const containerStyles = window.getComputedStyle(container);
    if (containerStyles.position === 'static') {
      container.style.position = 'relative';
    }

    return dummy;
  }

  const patch = init([
    attributesModule,
    classModule,
    propsModule,
    styleModule,
    eventListenersModule,
  ]);

  const VerticalTextAlignment = {
    TOP: 1,
    MIDDLE: 2,
    BOTTOM: 3,
  };

  function multiLineTextCalculator(
    nLines,
    fontSize,
    alignment = VerticalTextAlignment.BOTTOM
  ) {
    const dys = [];
    for (let i = 0; i < nLines; i++) {
      switch (alignment) {
        case VerticalTextAlignment.TOP:
          dys.push(fontSize * (i + 1));
          break;
        case VerticalTextAlignment.MIDDLE:
          dys.push(-fontSize * (0.5 * nLines - i - 1));
          break;
        case VerticalTextAlignment.BOTTOM:
        default:
          dys.push(-fontSize * (nLines - i - 1));
      }
    }
    return dys;
  }


  return {
    createSingleSVGRepresentationTest, createSVGRepresentationTest
  };

}