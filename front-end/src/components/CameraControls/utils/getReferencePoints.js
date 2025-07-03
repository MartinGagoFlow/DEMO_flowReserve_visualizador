/**
 * Calcula un nuevo punto desplazado desde p_cent en la dirección opuesta a n_ref.
 * 
 * @param {Object} aortaData - Objeto con propiedades n_ref y p_cent
 * @param {number} [size=10] - Factor de escala para el desplazamiento (por defecto 10)
 * @returns {Array<number> | null} Punto resultante [x, y, z] o null si los datos son inválidos
 */
export const getInverseOffsetPoint = (aortaData, size = 10) => {
  if (!aortaData?.n_ref || !aortaData?.p_cent) return null;

  const invertedNRef = aortaData.n_ref.map(val => -val * size);
  const offsetPoint = aortaData.p_cent.map((val, index) => val + invertedNRef[index]);

  return offsetPoint;
};

/**
 * Obtiene el inverso de un punto 3D.
 * Devuelve un nuevo punto con las coordenadas invertidas.
 * @param {*} puntoA 
 * @returns 
 */
export const obtenerInverso = (puntoA) => {
  if (!Array.isArray(puntoA) || puntoA.length !== 3) {
    throw new Error("El punto debe ser un array de 3 números.");
  }
  return puntoA.map(val => -val);
}

/**
 * Obtiene la escalar de un vector 3D.
 * Devuelve un nuevo vector con las coordenadas multiplicadas por el escalar.
 * @param {*} vector 
 * @param {*} escalar 
 * @returns 
 */
export const multiplicarVector = (vector, escalar) => {
  if (!Array.isArray(vector) || vector.length !== 3) {
    throw new Error("El vector debe ser un array de 3 números.");
  }
  return vector.map(val => val * escalar);
}

export const sumarVector = (vectorA, vectorB) => {
  if (!Array.isArray(vectorA) || !Array.isArray(vectorB) || vectorA.length !== 3 || vectorB.length !== 3) {
    throw new Error("Ambos vectores deben ser arrays de 3 números.");
  }
  return vectorA.map((val, index) => val + vectorB[index]);
}

export const restarVector = (vectorA, vectorB) => {
  if (!Array.isArray(vectorA) || !Array.isArray(vectorB) || vectorA.length !== 3 || vectorB.length !== 3) {
    throw new Error("Ambos vectores deben ser arrays de 3 números.");
  }
  return vectorA.map((val, index) => val - vectorB[index]);
}

/**
 * Calcula el punto medio (promedio) entre dos coordenadas 3D.
 *
 * @param {number[]} pointA - Primer punto como array [x, y, z].
 * @param {number[]} pointB - Segundo punto como array [x, y, z].
 * @returns {number[]} El punto medio como array [x, y, z].
 *
 * @example
 * const midpoint = getMidpoint([0, 0, 0], [10, 10, 10]);
 * console.log(midpoint); // [5, 5, 5]
 */
export const getMidlepoint = (pointA, pointB) => {
  if (!Array.isArray(pointA) || !Array.isArray(pointB) || pointA.length !== 3 || pointB.length !== 3) {
    throw new Error("Ambos puntos deben ser arrays de 3 números.");
  }
  return pointA.map((coord, index) => (coord + pointB[index]) / 2);
};


/**
 * Calcula la diferencia entre dos puntos 3D.
 * Devuelve un nuevo vector resultado de restar puntoB de puntoA.
 * 
 * @param {Array<number>} puntoA - Primer punto [x, y, z]
 * @param {Array<number>} puntoB - Segundo punto [x, y, z]
 * @returns {Array<number>} Vector diferencia [dx, dy, dz]
 */
export const calcularDiferencia = (puntoA, puntoB) => {
  if (!Array.isArray(puntoA) || !Array.isArray(puntoB) || puntoA.length !== 3 || puntoB.length !== 3) {
    throw new Error("Ambos puntos deben ser arrays de 3 números.");
  }

  return [
    puntoA[0] - puntoB[0],
    puntoA[1] - puntoB[1],
    puntoA[2] - puntoB[2]
  ];
};


/**
 * Calcula la norma (magnitud) del vector entre dos puntos 3D.
 * 
 * @param {number[]} pointA - Primer punto [x, y, z].
 * @param {number[]} pointB - Segundo punto [x, y, z].
 * @returns {number} - Norma (distancia euclidiana) entre los dos puntos.
 */
export const calcularNorma2Vector = (pointA, pointB) => {
  if (!Array.isArray(pointA) || !Array.isArray(pointB) || pointA.length !== 3 || pointB.length !== 3) {
    throw new Error("Ambos puntos deben ser arrays de 3 números.");
  }
  const diffVector = [
    pointA[0] - pointB[0],
    pointA[1] - pointB[1],
    pointA[2] - pointB[2]
  ];
  // Calcula la suma de los cuadrados de las diferencias
  // y luego toma la raíz cuadrada para obtener la norma
  const squareNum = diffVector.reduce((sum, val) => sum + val * val, 0);
  return Math.sqrt(squareNum);
}

/**
 * Calcucla el vector de dirección entre dos puntos 3D.
 * Devuelve un vector unitario que apunta de puntoA a puntoB.
 * @param {*} puntoA 
 * @param {*} puntoB 
 * @returns 
 */
export const calcularVectorDireccion = (puntoA, puntoB) => {
  
  const diferencia = calcularDiferencia(puntoA, puntoB);
  const norma = calcularNorma2Vector(puntoA, puntoB);

  if (norma === 0) {
    throw new Error("Los puntos son idénticos; no se puede calcular un vector de dirección.");
  }

  return diferencia.map(val => val / norma);
}


