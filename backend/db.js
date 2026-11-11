import pg from 'pg';

export function createPool(connectionString) {
  if (!connectionString) {
    throw new Error('Configurá DATABASE_URL para conectar la API con PostgreSQL.');
  }
  const pool = new pg.Pool({
    connectionString,
    max: 4,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 10000,
    allowExitOnIdle: true,
  });
  pool.on('error', (error) => console.error('Conexión PostgreSQL inactiva', error.code));
  return pool;
}
