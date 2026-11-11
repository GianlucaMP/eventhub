import { apiUrl } from '../../../config/api.js';

export const getEvents = async (signal) => {
  const respuesta = await fetch(`${apiUrl}/api/eventos`, { signal });
  const datos = await respuesta.json();
  if (!respuesta.ok || !Array.isArray(datos)) throw new Error('Catálogo no disponible');
  return datos;
};
