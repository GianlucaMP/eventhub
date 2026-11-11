import { apiUrl } from '../../../config/api.js';

export const createRegistration = async (eventoId, campos) => {
  const respuesta = await fetch(`${apiUrl}/api/eventos/${eventoId}/inscripciones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(campos),
  });

  if (respuesta.status === 201) return { confirmada: true };

  const error = await respuesta.json().catch(() => null);
  return { confirmada: false, error };
};
