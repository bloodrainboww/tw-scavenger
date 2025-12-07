(function () {
  if (window.SCAV_V211_LOADED) {
    UI.InfoMessage("Scavenger v2.1 zaten açık ✅");
    return;
  }
  window.SCAV_V211_LOADED = true;

  /* ================================
     AYARLAR
  ================================= */
  const UNIT_CAPACITY = {
    spear: 25,
    sword: 15,
    axe: 10,
    archer: 18,
    light: 80,
    marcher: 50,
    heavy: 50,
    knight: 100
  };

  const LEVEL_ORDER = [4, 3, 2, 1];
  let enterIndex = 0;
  let calculatedPackage = {};

  /* ================================
     TEMİZLEME EKRANINA OTO GİT
  ================================= */
  function goToScavenge() {
    if (!location.href.includes("mode=scavenge")) {
      const village = game_data.village.id;
      location.href = `/game.php?village=${village}&screen=place&mode=scavenge`;
      return true;
    }
    return false;
  }

  if (goToScavenge()) return;

  /* ================================
     PANEL
  ================================= */
  const panel = document.createElement("div");
  panel.id = "scav_panel_v211";
  panel.style.cssText = `
    position: fixed;
    right: 30px;
    top: 80px;
    width: 340px;
    background: #2f2f2f;
    color: #fff;
    z-index: 99999;
    padding: 12px;
    border-radius: 10px;
    font-size: 13px;
    box-shadow: 0 0 10px #000;
  `;

  panel.innerHTML = `
    <div style="text-align:center;font-weight:bold;font-size:14px;margin-bottom:8px">
      Temizleme Paneli v2.1
    </div>

    <div style="text-align:center;margin-bottom:6px">
      Süre:
      <input id="scav_time" type="text" value="01:30"
        style="width:70px;text-align:center">
    </div>

    <div id="unit_box" style="display:grid;grid-template-columns:1fr 1fr;gap:6px"></div>

    <button id="scav_calc_btn"
      style="width:100%;margin-top:10px;padding:8px;
      background:#3e8ed0;border:none;color:#fff;border-radius:6px">
      Hesapla (ENTER)
    </button>

    <div id="scav_log" style="margin-top:8px;font-size:11px;opacity:.9"></div>

    <div style="text-align:right;font-size:10px;opacity:.4;margin-top:6px">
      BloodRainBoww x ChatGPT
    </div>
  `;

  document.body.appendChild(panel);

  /* ================================
     OTOMATİK ASKER OKUMA + CHECKBOX
  ================================= */
  const unitBox = document.getElementById("unit_box");

  function getVillageUnitCount(unit) {
    const el = document.querySelector(`.unit-count-${unit}`);
    if (!el) return 0;
    return parseInt(el.innerText.replace(/\D/g, "")) || 0;
  }

  Object.keys(UNIT_CAPACITY).forEach(unit => {
    if (game_data.units.includes(unit)) {
      const row = document.createElement("div");
      row.innerHTML = `
        <label style="display:flex;align-items:center;gap:6px">
          <input type="checkbox" class="scav_unit" value="${unit}" checked>
          <img src="${image_base}unit_${unit}.png" width="18">
          <span id="count_${unit}">0</span>
        </label>
      `;
      unitBox.appendChild(row);
    }
  });

  function readUnitsAuto() {
    Object.keys(UNIT_CAPACITY).forEach(unit => {
      const count = getVillageUnitCount(unit);
      const el = document.getElementById(`count_${unit}`);
      if (el) el.innerText = count;
    });
    log("Askerler otomatik okundu ✅");
  }

  setTimeout(readUnitsAuto, 1200);

  /* ================================
     SÜRE HESABI
  ================================= */
  function parseTime(t) {
    let [h, m] = t.split(":").map(Number);
    return h * 3600 + m * 60;
  }

  function durationFormula(cap, pct) {
    return Math.round(
      (Math.pow((pct * cap) ** 2 * 100, 0.45) + 1800) * 0.7722074897
    );
  }

  function calculate() {
    const selected = [...document.querySelectorAll(".scav_unit:checked")]
      .map(e => e.value);

    if (!selected.length) {
      log("Seçili birlik yok!");
      return;
    }

    let totalCapacity = 0;
    let units = {};

    selected.forEach(u => {
      const count = getVillageUnitCount(u);
      units[u] = count;
      totalCapacity += count * UNIT_CAPACITY[u];
    });

    const totalSeconds = parseTime(document.getElementById("scav_time").value);

    calculatedPackage = {};

    LEVEL_ORDER.forEach((lvl, i) => {
      const pct = [0.75, 0.50, 0.25, 0.10][i];
      let targetCap = totalCapacity * pct;

      calculatedPackage[lvl] = {};

      Object.keys(units).forEach(unit => {
        const can = Math.min(
          units[unit],
          Math.floor(targetCap / UNIT_CAPACITY[unit])
        );
        calculatedPackage[lvl][unit] = can;
        units[unit] -= can;
        targetCap -= can * UNIT_CAPACITY[unit];
      });
    });

    enterIndex = 0;
    log("Hesaplandı ✅ ENTER ile sırayla yerleştir");
  }

  document.getElementById("scav_calc_btn").onclick = calculate;

  /* ================================
     ENTER ZİNCİRİ
  ================================= */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter") return;
    if (!calculatedPackage[LEVEL_ORDER[enterIndex]]) return;

    const lvl = LEVEL_ORDER[enterIndex];
    const block = document.querySelectorAll(".scavenge-option")[lvl - 1];
    if (!block) return;

    Object.entries(calculatedPackage[lvl]).forEach(([unit, val]) => {
      const input = block.querySelector(`input[name='${unit}']`);
      if (input) input.value = val;
    });

    log(`Seviye ${lvl} dolduruldu ✅`);
    enterIndex++;
  });

  /* ================================
     LOG
  ================================= */
  function log(t) {
    document.getElementById("scav_log").innerText = t;
  }

})();
