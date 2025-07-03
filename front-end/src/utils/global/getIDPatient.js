
/**
 * Recibe un path y devuelve el ID del paciente.
 * @param {*} fullPath 
 * @returns 
 */
export const getIDPatient = (fullPath) => {
  if (!fullPath) return null;

  // Normalizamos separadores a "/" para consistencia
  const normalizedPath = fullPath.replace(/\\/g, '/');

  // Dividimos el path en partes
  const parts = normalizedPath.split('/').filter(part => part); // Filtramos partes vacías

  // Si hay menos de 2 partes, no podemos retroceder lo suficiente
  if (parts.length < 2) return null;

  // El ID del paciente está dos niveles antes del último elemento
  return parts[parts.length - 3] || null;
};
