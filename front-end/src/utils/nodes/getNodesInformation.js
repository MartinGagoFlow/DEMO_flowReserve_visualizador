/**
 * @fileoverview Utilidades para analizar y extraer información estructural
 * del grafo cargado en la aplicación. Estas funciones se centran en identificar
 * tipos de nodos y extraer subconjuntos específicos de nodos según su tipo.
 *
 * Estas funciones se usan, por ejemplo, para posicionar elementos en la visualización
 * 3D o para organizar información semántica del modelo vascular.
 */

/**
 * Extrae todos los valores únicos del atributo `nodeType` presentes en los nodos del grafo.
 *
 * @param {React.MutableRefObject} graphDataRef - Referencia al grafo cargado (por ejemplo, generado a partir de un archivo GEXF).
 * @returns {string[]} Un array con los tipos de nodo únicos encontrados en el grafo.
 *
 * @example
 * const types = getUniqueNoteTypes(graphDataRef);
 * console.log(types); // ['innerNode', 'entry', 'junction', ...]
 */
export const getUniqueNoteTypes = (graphDataRef) => {
  const noteTypes = new Set();

  if (!graphDataRef.current) return [];

  graphDataRef.current.forEachNode((_, attributes) => {
    if (attributes.nodeType) {
      noteTypes.add(attributes.nodeType);
    }
  });

  return Array.from(noteTypes);
};


/**
 * Obtiene los valores únicos de un atributo específico presente en los nodos del grafo.
 * @param {object} graphDataRef - Referencia a los datos del grafo.
 * @param {string} attributeName - Nombre del atributo que se quiere extraer.
 * @returns {string[]|number[]} Lista de valores únicos para ese atributo.
 */
export const getUniqueDataAttributes = (graphDataRef, attributeName) => {
  const attributeValues = new Set();

  if (!graphDataRef?.current) return [];

  graphDataRef.current.forEachNode((_, attributes) => {
    const value = attributes[attributeName];
    if (value !== undefined && value !== null) {
      attributeValues.add(value);
    }
  });

  return Array.from(attributeValues);
};


/**
 * Filtra y obtiene todos los nodos del grafo que coincidan con un tipo de nodo específico (`nodeType`).
 *
 * Cada nodo devuelto incluye:
 * - El propio identificador del nodo.
 * - Su posición 3D como array `[x, y, z]`, extraído del atributo `pos`.
 * - Todos sus atributos originales para usos adicionales.
 *
 * @param {React.MutableRefObject} graphDataRef - Referencia al grafo cargado (por ejemplo, generado a partir de un archivo GEXF).
 * @param {string} nodeType - Tipo de nodo que se desea filtrar (por ejemplo, `'innerNode'`, `'LAD'`, etc.).
 * @returns {Array<{ node: string, posNumbers: number[], attributes: Object }>} Lista de nodos que coinciden con el tipo especificado.
 *
 * @example
 * const innerNodes = getInnerNodes(graphDataRef, 'innerNode');
 * console.log(innerNodes); // Lista de nodos con nodeType === 'innerNode'
 */
export const getInnerNodes = (graphDataRef, nodeType) => {
  const innerNodes = [];

  if (!graphDataRef.current) return innerNodes;

  graphDataRef.current.forEachNode((node, attributes) => {
    if (attributes.nodeType === nodeType) {
      const posNumbers = JSON.parse(attributes.pos);
      innerNodes.push({ node, posNumbers, attributes });
    }
  });

  return innerNodes;
};

/**
 * Obtiene los nodos cuyo atributo especificado coincide con un valor dado.
 * @param {object} graphDataRef - Referencia a los datos del grafo.
 * @param {string} attributeName - Nombre del atributo a evaluar (ej. "type", "group", etc.).
 * @param {*} expectedValue - Valor esperado del atributo.
 * @returns {Array} Lista de nodos con { node, posNumbers, attributes }.
 */
export const getNodesByAttribute = (graphDataRef, attributeName, expectedValue) => {
  const matchingNodes = [];

  if (!graphDataRef?.current) return matchingNodes;

  graphDataRef.current.forEachNode((node, attributes) => {
    if (attributes[attributeName] === expectedValue) {
      const posNumbers = attributes.pos ? JSON.parse(attributes.pos) : null;
      matchingNodes.push({ node, posNumbers, attributes });
    }
  });

  return matchingNodes;
};


/**
 * Obtiene la información de todos los nodos del grafo, incluyendo su posición y atributos.
 * @param {*} graphDataRef 
 * @returns 
 */
export const getNodesInformation = (graphDataRef) => {
  const innerNodes = [];
  if (!graphDataRef.current) return innerNodes;
  graphDataRef.current.forEachNode((node, attributes) => {
    const posNumbers = JSON.parse(attributes.pos);
    innerNodes.push({ node, posNumbers, attributes });
  }
  );
  return innerNodes;
}


/**
 * Función para obtener el nodo más cercano a un punto dado en el espacio 3D.
 * @param {number[]} pointRef {x, y, z} - Referencia al punto en el espacio 3D.
 * @param {Object} graphData Instancia de la clase Graph.
 * @returns {number} Devuelve el nodo más cercano al punto dado.
 */
export const findClosestNodeToPoint = async (pointRef, graphData) => {

  if (!graphData) return null;

  let closestNode = null;
  let minDistance = Infinity;

  graphData.forEachNode((node, attributes) => {
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
    console.warn('Node too far.');
    return null;
  }
  console.log("Obteniendo el nodo más cercano:", closestNode);
  return closestNode;
};
