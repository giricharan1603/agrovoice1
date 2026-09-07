// AgroVoice frontend — plain JS.
// By default this expects the backend on the same laptop at port 3001.
// If needed, open browser DevTools console and run:
// localStorage.setItem("AGROVOICE_API_BASE", "http://localhost:3001")
const API_BASE = localStorage.getItem("AGROVOICE_API_BASE") || "http://localhost:3001";

const AgroVoice = {
  async checkHealth() {
    const el = document.getElementById("api-status");
    if (!el) return;
    try {
      const r = await fetch(`${API_BASE}/api/health`);
      const j = await r.json();
      if (j.ok) {
        el.textContent = "✅ Connected to Oracle 11g backend.";
        el.className = "status ok";
      } else {
        throw new Error(j.error || "Unknown error");
      }
    } catch (e) {
      el.textContent = "❌ Backend not reachable at " + API_BASE + " — " + e.message;
      el.className = "status err";
    }
  },

  wireShipmentForm() {
    const form = document.getElementById("shipment-form");
    const msg = document.getElementById("form-msg");
    if (!form || !msg) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      msg.textContent = "Saving…";
      msg.className = "status";
      const data = Object.fromEntries(new FormData(form).entries());
      try {
        // 1. create farmer
        const fr = await fetch(`${API_BASE}/api/farmers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.farmer_name,
            phone: data.farmer_phone,
            village: data.farmer_village,
          }),
        }).then(r => r.json());
        if (fr.error) throw new Error(fr.error);

        // 2. create shipment
        const sr = await fetch(`${API_BASE}/api/shipments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            farmer_id: fr.id,
            produce: data.produce,
            quantity_kg: Number(data.quantity_kg),
            pickup: data.pickup,
            dropoff: data.dropoff,
            pickup_date: data.pickup_date,
          }),
        }).then(r => r.json());
        if (sr.error) throw new Error(sr.error);

        msg.textContent = `✅ Saved. Shipment #${sr.id} created for farmer #${fr.id}.`;
        msg.className = "status ok";
        form.reset();
      } catch (err) {
        msg.textContent = "❌ " + err.message;
        msg.className = "status err";
      }
    });
  },

  async loadShipments() {
    const el = document.getElementById("shipments");
    if (!el) return;

    try {
      const rows = await fetch(`${API_BASE}/api/shipments`).then(r => r.json());
      if (rows.error) throw new Error(rows.error);
      if (!rows.length) { el.innerHTML = "<p class='muted'>No shipments yet.</p>"; return; }
      el.innerHTML = `
        <table>
          <thead><tr>
            <th>#</th><th>Produce</th><th>Qty (kg)</th>
            <th>Pickup</th><th>Dropoff</th><th>Date</th><th>Status</th>
          </tr></thead>
          <tbody>
            ${rows.map(r => `
              <tr>
                <td>${r.ID}</td>
                <td>${r.PRODUCE ?? ""}</td>
                <td>${r.QUANTITY_KG ?? ""}</td>
                <td>${r.PICKUP ?? ""}</td>
                <td>${r.DROPOFF ?? ""}</td>
                <td>${r.PICKUP_DATE ? new Date(r.PICKUP_DATE).toLocaleDateString() : ""}</td>
                <td><span class="badge">${r.STATUS ?? ""}</span></td>
              </tr>
            `).join("")}
          </tbody>
        </table>`;
    } catch (e) {
      el.innerHTML = `<p class="status err">❌ ${e.message}</p>`;
    }
  },
};
