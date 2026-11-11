# EventHub · Agenda académica

EventHub muestra talleres y charlas y permite reservar un lugar con nombre y correo. React consulta la API de Express. Express lee el catálogo de PostgreSQL y llama a una función SQL que bloquea el evento hasta terminar el alta. Así, dos solicitudes por el último lugar no pueden confirmar ambas.

- `frontend/` contiene la aplicación React con JSX, JavaScript, Vite y CSS.
- `backend/` contiene Express, los endpoints JSON y las pruebas de integración.
- `supabase/` contiene la migración y el seed de demostración.

## Preparar la base

Usá Node.js 22.12+ dentro de la rama 22 o Node.js 24, npm y una base PostgreSQL vacía.

**Supabase.** Ejecutá primero `supabase/migrations/20261109000100_eventhub.sql` en el SQL Editor y después `supabase/seed.sql`. En **Connect**, copiá la URL del **Transaction pooler** (puerto 6543) para el backend. Completá la contraseña, codificá los caracteres especiales como parte de la URL y agregá `?sslmode=verify-full` si la URL todavía no trae opciones SSL. El backend usa consultas parametrizadas sin nombres de sentencias preparadas y una sola llamada SQL para cada alta. [Conexiones a PostgreSQL en Supabase](https://supabase.com/docs/guides/database/connecting-to-postgres)

**PostgreSQL local en Linux.** Si tenés instalado el servidor PostgreSQL, ejecutá desde la raíz:

```bash
bash scripts/db-local.sh start
```

El script inicia una instancia propia con un socket local, crea la base, aplica la migración y carga el seed. Guarda los datos en `.eventhub-local/` y genera `backend/.env` si todavía no existe. Si ya tenés ese archivo y querés cambiar a la base local, copiá la línea `DATABASE_URL` que imprime el script. Usá `bash scripts/db-local.sh stop` para detener PostgreSQL y `start` para volver a abrir la misma base.

Si ya tenés un servidor PostgreSQL en marcha y un usuario con permiso para crear bases, también podés preparar la base manualmente:

```bash
createdb eventhub
psql -X -v ON_ERROR_STOP=1 -d eventhub \
  -f supabase/migrations/20261109000100_eventhub.sql -f supabase/seed.sql
```

Las tablas, la vista y la función viven en el esquema privado `eventhub`. Usá una conexión PostgreSQL autorizada para ese esquema y conservá la URL únicamente en el backend. Mantené el esquema fuera de los esquemas expuestos de la Data API de Supabase.

El seed deja un lugar en **Introducción a React**, cinco en **APIs con Node.js** y **Primeros pasos con PostgreSQL** completo. Reservá Introducción a React para el cierre del taller y usá una base aparte para ensayar. Volver a aplicar el seed conserva las inscripciones existentes.

## Ejecutar en local

Desde la raíz, prepará ambos entornos e instalá las dependencias.

```bash
test -f backend/.env || cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
npm --prefix backend ci
npm --prefix frontend ci
```

Si el script local generó `backend/.env`, ya está listo. Si partiste del archivo de ejemplo, completá `DATABASE_URL` con tu conexión. Dejá `CORS_ORIGIN=http://localhost:5173` para Vite. En `frontend/.env`, `VITE_API_URL` apunta a la URL base de Express, sin el sufijo `/api`.

```bash
# Terminal 1
npm --prefix backend run dev

# Terminal 2
npm --prefix frontend run dev
```

Abrí [el tablero local](http://localhost:5173). Para consultar la API por separado, probá lo siguiente en una base de ensayo. El evento 2 corresponde a APIs con Node.js en el seed.

```bash
curl -i http://localhost:3000/api/eventos
curl -i -X POST http://localhost:3000/api/eventos/2/inscripciones \
  -H 'Content-Type: application/json' \
  --data '{"nombre":"Ana Pérez","email":"ana@example.com"}'
```

## Verificar la entrega

Prepará una base **desechable y separada** para la prueba automatizada. Ajustá el usuario, el host y el puerto según tu instalación. La prueba crea y limpia sus propios eventos.

```bash
createdb eventhub_test
psql -X -v ON_ERROR_STOP=1 -d eventhub_test -f supabase/migrations/20261109000100_eventhub.sql
TEST_DATABASE_URL='postgresql://localhost:5432/eventhub_test' npm --prefix backend test
npm --prefix frontend run build
```

La prueba cubre el catálogo ordenado, los campos públicos, CORS y preflight, el único ganador para el último cupo, la prioridad del duplicado ante un evento lleno, el mismo correo en otro evento, la normalización y las respuestas por datos o ID inválidos. Sin `TEST_DATABASE_URL`, la prueba queda omitida.

1. Con el seed aplicado, comprobá que se vean tres eventos, dos con disponibilidad y seis lugares en total.
2. En un ensayo, inscribite a **APIs con Node.js** con un correo ficticio nuevo. Confirmá el POST `201` en Network, el aviso verde y un cupo menos. Recargá y comprobá que el cupo se conserve. Repetí con el mismo correo en mayúsculas y verificá que el formulario conserve los campos y muestre el error de duplicado.
3. Para comprobar la recuperación del catálogo, abrí el formulario y en DevTools bloqueá la URL exacta del GET (`http://localhost:3000/api/eventos`), sin comodines. Confirmá la inscripción. El POST debe devolver `201` y el aviso verde debe seguir visible aunque el GET falle. Quitá el bloqueo y elegí **Recargar eventos**. En Network debe aparecer un nuevo GET y el cupo debe actualizarse sin otro POST.
4. En el cierre, usá **Introducción a React** y comprobá que al agotarse el único cupo se deshabilite su botón.

## Desplegar en Vercel durante el taller

1. Publicá el repositorio Git de `eventhub-app` en GitHub, GitLab o Bitbucket. Desde la raíz del repo, agregá la URL real como remoto y subí `main`.

   ```bash
   git remote add origin URL_DEL_REPOSITORIO
   git push -u origin main
   ```

2. Aplicá la migración y el seed en Supabase según la sección [Preparar la base](#preparar-la-base). Usá la URL del **Transaction pooler** para `DATABASE_URL` en Vercel.
3. Importá el mismo repo dos veces en Vercel. Elegí las raíces de la tabla y reservá los nombres de ambos proyectos para conocer sus dominios de producción. Seleccioná Node.js 22 o 24 en ambos.

   | Proyecto | Root Directory | Framework | Variables de producción |
   | --- | --- | --- | --- |
   | API | `backend` | Express. Vercel detecta el export por defecto de `app.js`. | `DATABASE_URL` y `CORS_ORIGIN=https://tu-frontend.vercel.app` |
   | Web | `frontend` | Vite. `vercel.json` fija el build y la salida `dist`. | `VITE_API_URL=https://tu-api.vercel.app` |

4. Desplegá la API y verificá el catálogo con los dominios reales. `CORS_ORIGIN` debe coincidir exactamente con el origen del frontend, con esquema y sin barra final.

   ```bash
   API_URL=https://tu-api.vercel.app
   WEB_ORIGIN=https://tu-frontend.vercel.app

   curl -i "$API_URL/api/eventos" -H "Origin: $WEB_ORIGIN"
   curl -i -X OPTIONS "$API_URL/api/eventos/2/inscripciones" \
     -H "Origin: $WEB_ORIGIN" \
     -H 'Access-Control-Request-Method: POST' \
     -H 'Access-Control-Request-Headers: Content-Type'
   ```

   El GET debe devolver `200` y el preflight `204`. Ambas respuestas deben incluir `Access-Control-Allow-Origin` con el dominio web.
5. Desplegá el frontend con la URL de la API cargada en `VITE_API_URL`. Abrí el tablero, inscribite con datos ficticios en **APIs con Node.js** y comprobá en Network que el POST devuelve `201`. Recargá para verificar el cupo. Reservá **Introducción a React** para el cierre.

Si cambiás una variable de producción, volvé a desplegar el proyecto correspondiente. Vite incorpora `VITE_API_URL` al compilar. Guardá la conexión de Supabase únicamente en el proyecto de la API. [Monorepos en Vercel](https://vercel.com/docs/monorepos) · [Express en Vercel](https://vercel.com/docs/frameworks/backend/express) · [Vite en Vercel](https://vercel.com/docs/frameworks/frontend/vite)

## Estado de verificación

Se aplicaron la migración y el seed en PostgreSQL 18 local. Pasaron `npm --prefix backend test` con una base de prueba y `npm --prefix frontend run build`. En el navegador se verificaron los tres eventos del seed, la confirmación, el cupo persistente tras recargar y la recuperación ante un GET fallido sin repetir el POST. La conexión a Supabase y la prueba pública de Vercel quedan para el taller.
