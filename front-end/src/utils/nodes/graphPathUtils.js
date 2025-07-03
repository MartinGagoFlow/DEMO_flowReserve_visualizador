import { parse } from 'graphology-gexf/browser';
import { Graph } from 'graphology';
import { unweighted } from 'graphology-shortest-path';
import { findClosestNodeToPoint } from './getNodesInformation';

/**
 * Calcula el camino más corto entre dos puntos 3D en un grafo cargado desde un archivo GEXF.
 *
 * @param {number[]} pos1 - Punto 3D de origen [x, y, z].
 * @param {number[]} pos2 - Punto 3D de destino [x, y, z].
 * @param {Object} graphData - Grafo en memoria (usado para encontrar nodos cercanos a las posiciones).
 * @param {string} graphPath - Ruta del modelo GEXF que se va a cargar desde el backend.
 * @returns {Promise<Object>} - Datos del camino más corto, incluyendo el array de nodos, FFR, radio, diámetro, posición, etc.
 */
export const calculateShortestPathTest = async (pos1, pos2, graphData, graphPath) => {
    const sourceNode = await findClosestNodeToPoint(pos1, graphData);
    const targetNode = await findClosestNodeToPoint(pos2, graphData);
    if (!sourceNode || !targetNode) return {};
    try {
        console.log("graphPath:", graphPath);
        const res = await fetch(`http://127.0.0.1:5000/api/models/${graphPath}`);
        const gexf = await res.text();
        const graph = parse(Graph, gexf);
        const path = unweighted.bidirectional(graph, sourceNode, targetNode);
        const ffrCorrectedValues = path.map(
            (nodeId) => parseFloat(graph.getNodeAttributes(nodeId).FFR_Corrected)
        );
        const ffrValues = path.map(
            (nodeId) => parseFloat(graph.getNodeAttributes(nodeId).FFR)
        );
        const positionValue = path.map(
            (nodeId) => graph.getNodeAttributes(nodeId).pos
        );
        const degree = path.map((nodeId) => graph.degree(nodeId));
        const radius = path.map(
            (nodeId) => graph.getNodeAttributes(nodeId).radius
        );
        const diameter = path.map(
            (nodeId) => (graph.getNodeAttributes(nodeId).radius * 2).toFixed(1)
        );
        return { path, ffrCorrectedValues, positionValue, degree, radius, diameter };
    } catch (error) {
        console.error('Error loading GEXF file:', error);
    }
};

/**
 * Calcula el camino más corto entre dos nodos en un grafo cargado desde un archivo GEXF.
 * @param {*} sourceNode 
 * @param {*} targetNode 
 * @param {*} graphPath 
 * @returns 
 */
export const calculateShortestNodePath = async (sourceNode, targetNode, graphPath) => {
    try {
        console.log("graphPath", graphPath)
        const res = await fetch(`http://127.0.0.1:5000/api/models/${graphPath}`);
        const gexf = await res.text();
        const graph = parse(Graph, gexf);
        const path = unweighted.bidirectional(graph, sourceNode, targetNode);
        const ffrCorrectedValues = path.map(
            (nodeId) => parseFloat(graph.getNodeAttributes(nodeId).FFR_Corrected)
        );
        const ffrValues = path.map(
            (nodeId) => parseFloat(graph.getNodeAttributes(nodeId).FFR)
        );
        const positionValue = path.map(
            (nodeId) => graph.getNodeAttributes(nodeId).pos
        );
        const degree = path.map((nodeId) => graph.degree(nodeId));
        const radius = path.map(
            (nodeId) => graph.getNodeAttributes(nodeId).radius
        );
        const diameter = path.map(
            (nodeId) => (graph.getNodeAttributes(nodeId).radius * 2).toFixed(1)
        );
        return { path, ffrCorrectedValues, positionValue, degree, radius, diameter };
    } catch (error) {
        console.error('Error loading GEXF file:', error);
    }
}