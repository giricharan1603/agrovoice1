const express = require('express');
const cors = require('cors');
const { query, initPool, closePool, oracledb } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

function requiredText(value, fieldName) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${fieldName} is required`);
  }
  return value.trim();
}

function optionalText(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function requiredNumber(value, fieldName) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    throw new Error(`${fieldName} must be a number greater than 0`);
  }
  return numberValue;
}

app.get('/api/health', async (req, res) => {
  try {
    const r = await query('SELECT 1 AS ok FROM dual');
    res.json({ ok: true, db: r.rows[0] });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// --- FARMERS ---------------------------------------------------------------
app.post('/api/farmers', async (req, res) => {
  try {
    const name = requiredText(req.body.name, 'Farmer name');
    const phone = requiredText(req.body.phone, 'Phone');
    const village = optionalText(req.body.village);

    const r = await query(
      `INSERT INTO farmers (name, phone, village)
       VALUES (:name, :phone, :village)
       RETURNING id INTO :id`,
      {
        name, phone, village,
        id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
      }
    );
    res.json({ id: r.outBinds.id[0] });
  } catch (e) {
    res.status(e.message.includes('required') ? 400 : 500).json({ error: e.message });
  }
});

// --- SHIPMENTS -------------------------------------------------------------
app.get('/api/shipments', async (req, res) => {
  try {
    const r = await query(
      `SELECT id, farmer_id, produce, quantity_kg, pickup, dropoff,
              pickup_date, status
       FROM shipments ORDER BY id DESC`
    );
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/shipments', async (req, res) => {
  try {
    const farmer_id = requiredNumber(req.body.farmer_id, 'Farmer ID');
    const produce = requiredText(req.body.produce, 'Produce');
    const quantity_kg = requiredNumber(req.body.quantity_kg, 'Quantity');
    const pickup = requiredText(req.body.pickup, 'Pickup location');
    const dropoff = requiredText(req.body.dropoff, 'Drop-off location');
    const pickup_date = requiredText(req.body.pickup_date, 'Pickup date');

    const r = await query(
      `INSERT INTO shipments
         (farmer_id, produce, quantity_kg, pickup, dropoff, pickup_date, status)
       VALUES
         (:farmer_id, :produce, :quantity_kg, :pickup, :dropoff,
          TO_DATE(:pickup_date,'YYYY-MM-DD'), 'PENDING')
       RETURNING id INTO :id`,
      {
        farmer_id, produce, quantity_kg, pickup, dropoff, pickup_date,
        id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
      }
    );
    res.json({ id: r.outBinds.id[0] });
  } catch (e) {
    res.status(e.message.includes('required') || e.message.includes('greater than 0') ? 400 : 500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3001;
initPool()
  .then(() => app.listen(PORT, () =>
    console.log(`AgroVoice API listening on http://localhost:${PORT}`)))
  .catch(err => {
    console.error('Startup failed:', err);
    process.exit(1);
  });

process.on('SIGINT', async () => { await closePool(); process.exit(0); });
