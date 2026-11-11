import cors from 'cors';
import express from 'express';
import { createPool } from './db.js';

const errores = {
  DATOS_INVALIDOS: [400, 'Ingresá un nombre y un correo electrónico válidos.'],
  EVENTO_NO_ENCONTRADO: [404, 'El evento no existe.'],
  INSCRIPCION_DUPLICADA: [409, 'Este correo ya está inscrito en el evento.'],
  EVENTO_SIN_CUPO: [409, 'Ya no quedan cupos para este evento.'],
  ERROR_INTERNO: [500, 'Ocurrió un error. Intentá nuevamente.'],
};

function responderError(res, codigo, mensaje) {
  const [estado, mensajePredeterminado] = errores[codigo];
  return res.status(estado).json({ codigo, mensaje: mensaje ?? mensajePredeterminado });
}

function validarInscripcion(body) {
  if (typeof body?.nombre !== 'string' || typeof body?.email !== 'string') return null;

  const nombre = body.nombre.trim();
  const email = body.email.trim().toLowerCase();
  const formatoEmail = /^[^\s@.]+(?:\.[^\s@.]+)*@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/;
  if (!nombre || [...nombre].length > 100 || email.length > 254 || !formatoEmail.test(email)) {
    return null;
  }
  if (/[\u0000-\u001f\u007f]/.test(nombre) || /[\u0000-\u001f\u007f]/.test(email)) return null;
  return { nombre, email };
}

export function createApp({ pool, origin = process.env.CORS_ORIGIN || 'http://localhost:5173' } = {}) {
  const app = express();
  let db = pool;
  const query = (...args) => (db ??= createPool(process.env.DATABASE_URL)).query(...args);

  app.disable('x-powered-by');
  app.use('/api', cors({ origin: (requestOrigin, callback) => callback(null, requestOrigin === origin),
    methods: ['GET', 'POST'], allowedHeaders: ['Content-Type'] }));
  app.use('/api', (_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });
  app.use('/api', express.json({ limit: '8kb' }));

  app.get('/api/eventos', async (_req, res) => {
    const { rows } = await query('select * from eventhub.catalogo order by fecha, id');
    res.json(rows);
  });

  app.post('/api/eventos/:id/inscripciones', async (req, res) => {
    const eventoId = Number(req.params.id);
    if (!/^[0-9]+$/.test(req.params.id) || eventoId < 1 || eventoId > 2147483647) {
      return responderError(res, 'DATOS_INVALIDOS', 'El identificador del evento no es válido.');
    }

    const datos = validarInscripcion(req.body);
    if (!datos) return responderError(res, 'DATOS_INVALIDOS');

    const { rows: [{ codigo }] } = await query(
      'select eventhub.inscribir($1, $2, $3) as codigo',
      [eventoId, datos.nombre, datos.email],
    );

    if (codigo !== 'CONFIRMADA') return responderError(res, codigo);
    return res.status(201).json({ mensaje: 'Inscripción confirmada', eventoId });
  });

  app.use('/api', (_req, res) => {
    res.status(404).json({ codigo: 'RUTA_NO_ENCONTRADA', mensaje: 'La ruta solicitada no existe.' });
  });

  app.use((error, _req, res, _next) => {
    if (error.status >= 400 && error.status < 500) {
      return responderError(res, 'DATOS_INVALIDOS', 'La solicitud contiene datos inválidos.');
    }
    console.error('Error de la API', error.code || error.name);
    return responderError(res, 'ERROR_INTERNO');
  });

  return app;
}

export default createApp();
