import assert from 'node:assert/strict';
import { once } from 'node:events';
import test from 'node:test';
import { createApp } from '../app.js';
import { createPool } from '../db.js';

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const origin = 'http://localhost:5173';

test('API de inscripciones sobre PostgreSQL', {
  skip: !testDatabaseUrl && 'Configurá TEST_DATABASE_URL con la migración aplicada.',
}, async (t) => {
  assert.notEqual(testDatabaseUrl, process.env.DATABASE_URL, 'Usá una base separada para las pruebas.');
  const pool = createPool(testDatabaseUrl);
  const ids = [];
  let server;
  t.after(async () => {
    try {
      if (server?.listening) await new Promise((resolve) => server.close(resolve));
      if (ids.length) {
        await pool.query('delete from eventhub.inscripciones where evento_id = any($1)', [ids]);
        await pool.query('delete from eventhub.eventos where id = any($1)', [ids]);
      }
    } finally {
      await pool.end();
    }
  });

  const { rows } = await pool.query(`
    insert into eventhub.eventos (titulo, descripcion, fecha, modalidad, capacidad)
    values ('Prueba de concurrencia', 'Evento temporal', now(), 'Virtual', 1),
           ('Prueba de otro evento', 'Evento temporal', now(), 'Presencial', 2)
    returning id
  `);
  ids.push(...rows.map(({ id }) => id));

  server = createApp({ pool, origin }).listen(0, '127.0.0.1');
  await once(server, 'listening');
  const catalogUrl = `http://127.0.0.1:${server.address().port}/api/eventos`;
  const inscripcionesUrl = (id) => `${catalogUrl}/${id}/inscripciones`;
  const inscribir = (id, email, nombre = '  Ana Pérez  ') => fetch(inscripcionesUrl(id), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin },
    body: JSON.stringify({ nombre, email }),
  });

  await t.test('catálogo inicial, privacidad y preflight', async () => {
    const respuesta = await fetch(catalogUrl);
    assert.equal(respuesta.status, 200);
    assert.equal(respuesta.headers.get('cache-control'), 'no-store');
    const eventos = await respuesta.json();
    const primero = eventos.find(({ id }) => id === ids[0]);
    assert.equal(primero.cuposDisponibles, 1);
    assert.deepEqual(Object.keys(primero).sort(), [
      'capacidad', 'cuposDisponibles', 'descripcion', 'fecha', 'id', 'modalidad', 'titulo',
    ]);
    assert.deepEqual(eventos, [...eventos].sort((a, b) => Date.parse(a.fecha) - Date.parse(b.fecha) || a.id - b.id));

    const preflight = (requestOrigin) => fetch(inscripcionesUrl(ids[0]), {
      method: 'OPTIONS',
      headers: {
        Origin: requestOrigin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type',
      },
    });
    const permitido = await preflight(origin);
    assert.equal(permitido.status, 204);
    assert.equal(permitido.headers.get('access-control-allow-origin'), origin);
    assert.equal((await preflight('https://otro.example')).headers.get('access-control-allow-origin'), null);
  });

  await t.test('dos POST simultáneos por el último lugar confirman una sola alta', async () => {
    const correos = ['primera@example.com', 'segunda@example.com'];
    const respuestas = await Promise.all(correos.map((email) => inscribir(ids[0], email)));
    assert.deepEqual(respuestas.map(({ status }) => status).sort(), [201, 409]);
    const ganador = respuestas.findIndex(({ status }) => status === 201);
    assert.deepEqual(await respuestas[ganador].json(), { mensaje: 'Inscripción confirmada', eventoId: ids[0] });
    assert.equal((await respuestas[1 - ganador].json()).codigo, 'EVENTO_SIN_CUPO');

    const catalogo = await (await fetch(catalogUrl)).json();
    assert.equal(catalogo.find(({ id }) => id === ids[0]).cuposDisponibles, 0);

    const correoConEspacios = `  ${correos[ganador].toUpperCase()}  `;
    const duplicado = await inscribir(ids[0], correoConEspacios);
    assert.equal(duplicado.status, 409);
    assert.equal((await duplicado.json()).codigo, 'INSCRIPCION_DUPLICADA');
    const otroEvento = await inscribir(ids[1], correoConEspacios);
    assert.equal(otroEvento.status, 201);

    const confirmadas = await pool.query(
      'select nombre, email from eventhub.inscripciones where evento_id = any($1) order by evento_id',
      [ids],
    );
    assert.deepEqual(confirmadas.rows, Array(2).fill({ nombre: 'Ana Pérez', email: correos[ganador] }));
  });

  await t.test('valida ID, campos y JSON antes de inscribir', async () => {
    for (const respuesta of [
      await inscribir('1e2', 'persona@example.com'),
      await inscribir('2147483648', 'persona@example.com'),
      await inscribir(ids[1], 'correo-invalido'),
      await inscribir(ids[1], 'persona@example.com', '   '),
      await fetch(inscripcionesUrl(ids[1]), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{',
      }),
    ]) {
      assert.equal(respuesta.status, 400);
      assert.equal((await respuesta.json()).codigo, 'DATOS_INVALIDOS');
    }
    const ausente = await inscribir(2147483647, 'persona@example.com');
    assert.equal(ausente.status, 404);
    assert.equal((await ausente.json()).codigo, 'EVENTO_NO_ENCONTRADO');
  });
});
