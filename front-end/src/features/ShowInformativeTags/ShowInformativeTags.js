import { getUniqueDataAttributes, getNodesByAttribute } from "../../utils/nodes/getNodesInformation";

/**
 * Recoge los nodos centrales por tipo y genera una única representación SVG para todos.
 * @param {React.RefObject} graphDataRef - Referencia al grafo.
 * @param {Function} createSingleSVGRepresentationTest - Función de utilidad para crear el SVG.
 * @param {Object} svgConfig - Opciones de estilo para las etiquetas SVG.
 */
function createSVGRepresentationsFromGraphData(graphDataRef, createSingleSVGRepresentationTest, svgConfig = {}) {
  const defaultConfig = {
    includeRedDot: false,
    redDotSize: 0,
    backgroundColor: 'white',
    color: 'red',
    fontColor: 'black',
    redDotOffset: { x: 0, y: 0 },
    fontSize: 20,
    showBox: false,
    labelOffset: { offsetX: 60, offsetY: -36 },
    alternateOffset: true,
    fontWeight: 'bold',
  };

  const finalConfig = { ...defaultConfig, ...svgConfig };
  const uniqueTypes = getUniqueDataAttributes(graphDataRef, 'names');

  const labelData = [];

  uniqueTypes.forEach((rawType) => {
    // Limpieza del texto
    const type = rawType.replace(/[\[\]']/g, '').trim();

    // Ignorar tipos no deseados
    if (type === 'Other' || type === 'LM') {
      return;
    }

    const nodes = getNodesByAttribute(graphDataRef, 'names', rawType); // se usa rawType para mantener el criterio de búsqueda original

    if (Array.isArray(nodes) && nodes.length > 0) {
      const middleIndex = Math.floor(nodes.length / 2);
      const middleNode = nodes[middleIndex];

      if (middleNode?.posNumbers) {
        labelData.push({
          text: type, // nombre limpio
          position: middleNode.posNumbers
        });
      }
    }
  });

  if (labelData.length > 0) {
    const cleanup = createSingleSVGRepresentationTest(labelData, finalConfig, 'label-aorta-data');
    return cleanup;
  } else {
    console.warn("No se encontraron datos válidos para etiquetar.");
  }
  return null;
}

export default createSVGRepresentationsFromGraphData;
