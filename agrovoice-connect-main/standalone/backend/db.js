// Oracle 11g connection pool.
// Uses the node-oracledb driver in Thick mode (Oracle 11g requires it).
require('dotenv').config();
const oracledb = require('oracledb');

// Oracle 11g is NOT supported by oracledb's default Thin mode.
// You MUST have Oracle Instant Client installed and on PATH / LD_LIBRARY_PATH.
try {
  const libDir = process.env.ORACLE_CLIENT_LIB_DIR && process.env.ORACLE_CLIENT_LIB_DIR.trim();
  oracledb.initOracleClient(libDir ? { libDir } : undefined);
} catch (err) {
  console.error('Failed to init Oracle Instant Client:', err.message);
  console.error('Fix: install Oracle Instant Client and either add it to PATH or set ORACLE_CLIENT_LIB_DIR in .env.');
  process.exit(1);
}

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = true;

let pool;

function requireEnv(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing ${name}. Open standalone/backend/.env and set ${name}.`);
  }
  return value.trim();
}

async function initPool() {
  if (pool) return pool;
  pool = await oracledb.createPool({
    user: requireEnv('ORACLE_USER'),
    password: requireEnv('ORACLE_PASSWORD'),
    connectString: requireEnv('ORACLE_CONNECT_STRING'),
    poolMin: 1,
    poolMax: 5,
    poolIncrement: 1,
  });
  return pool;
}

async function query(sql, binds = {}, opts = {}) {
  await initPool();
  const conn = await oracledb.getConnection();
  try {
    return await conn.execute(sql, binds, opts);
  } finally {
    await conn.close();
  }
}

async function closePool() {
  if (pool) await pool.close(0);
}

module.exports = { initPool, query, closePool, oracledb };
