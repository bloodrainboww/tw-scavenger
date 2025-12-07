// =====================================================
//  SCAVENGER MODULE - TRIBAL WARS CLEAN SCAVENGING TOOL
//  FINAL VERSION - Single Input / Sequential Fill (4→3→2→1)
//  Dark mode + Full units + Reserve safe mode
// =====================================================

window.TW_SCAV_ACTIVE = true;

/* ============================
   AUTO BOOT
============================ */
window.__SCAVENGER_BOOT = function () {

    if (location.href.includes("screen=place") && location.href.includes("mode=scavenge")) {
        initModule();
        return;
    }

    const villageMatch = location.href.match(/village=(\d+)/);
    const villageId = villageMatch ? villageMatch[1] : null;
    if (!villageId) {
        alert("Köy ID bulunamadı.");
        return;
    }

    location.href = `/game.php?village=${villageId}&screen=place&mode=scavenge&scav_start=1`;
};

if (location.search.includes("scav_start=1")) {
    setTimeout(() => initModule(), 300);
}

/* ============================
   PANEL UI - DARK MODE
============================ */
function initModule() {

    if (document.getElementById("scavenger-panel")) {
        document.getElementById("scavenger-panel").style.display = "block";
        return;
    }

    const panel = document.createElement("div");
    panel.id = "scavenger-panel";

    panel.style.cssText = `
        position: fixed;
        top: 80px;
        right: 40px;
        background: #111;
        color: #f2f2f2;
        padding: 12px;
        border: 1px solid #444;
        border-radius: 10px;
        width: 300px;
        z-index: 99999;
        font-size: 13px;
        box-shadow: 0 0 8px rgba(0,0,0,0.7);
    `;

    function unitRow(unit, label) {
        return `
        <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
            <label style="display:flex;align-items:center;gap:6px;">
                <input type="checkbox" class="unit-select" value="${unit}">
                <img src="/graphic/unit/unit_${unit}.png" style="width:16px;height:16px;">
                <span>${label}</span>
            </label>
            <input id="reserve_${unit}" type="number" value="0" min="0"
                style="width:60px;padding:2px;background:#222;border:1px solid #555;color:#eee;">
        </div>`;
    }

    panel.innerHTML = `
        <b>Temizleme Modülü (Final)</b><br><br>

        <button id="scav_calc"
            style="width:100%;padding:6px;margin-bottom:6px;background:#c89b54;border:1px solid #805c23;color:#111;font-weight:bold;">
            Hesapla ve Yerleştir
        </button>

        ${unitRow("spear", "Mızrak")}
        ${unitRow("sword", "Kılıç")}
        ${unitRow("axe", "Balta")}
        ${unitRow("archer", "Okçu")}
        ${unitRow("light", "Hafif Atlı")}
        ${unitRow("marcher", "Atlı Okçu")}
        ${unitRow("heavy", "Ağır Atlı")}
        ${unitRow("knight", "Şövalye")}

        <br>
        <button id="scav_close"
            style="width:100%;padding:5px;background:#333;border:1px solid #555;color:#eee;">
            Kapat
        </button>
    `;

    document.body.appendChild(panel);
    document.getElementById("scav_calc").onclick = runCalculation;
    document.getElementById("scav_close").onclick = () => panel.style.display = "none";
}

/* ============================
   HESAPLAMA SİSTEMİ
============================ */
window.SCAV_PLAN = null;

function runCalculation() {

    const unitInputs = {
        spear: "unit_input_spear",
        sword: "unit_input_sword",
        axe: "unit_input_axe",
        archer: "unit_input_archer",
        light: "unit_input_light",
        marcher: "unit_input_marcher",
        heavy: "unit_input_heavy",
        knight: "unit_input_knight"
    };

    const unitCaps = {
        spear: 25,
        sword: 15,
        axe: 10,
        archer: 18,
        light: 80,
        marcher: 50,
        heavy: 50,
        knight: 100
    };

    const activeUnits = [...document.querySelectorAll(".unit-select:checked")].map(e => e.value);
    if (!activeUnits.length) {
        alert("En az bir birlik seçmelisin.");
        return;
    }

    if (!window.SCAV_PLAN || !window.SCAV_PLAN.remaining.length) {

        const available = {};
        const rawAvailable = {};
        let totalEq = 0;
        let rawEq = 0;
        const spearCap = unitCaps.spear;

        activeUnits.forEach(unit => {

            const el = document.getElementById(unitInputs[unit]);
            if (!el) return;

            const raw = parseInt(el.dataset.all) || parseInt(el.value) || 0;
            rawAvailable[unit] = raw;
            rawEq += raw * (unitCaps[unit] / spearCap);

            const reserve = parseInt(document.getElementById("reserve_" + unit)?.value) || 0;
            const usable = Math.max(raw - reserve, 0);
            available[unit] = usable;
            totalEq += usable * (unitCaps[unit] / spearCap);
        });

        if (rawEq <= 0) {
            alert("Seçili birliklerde hiç asker yok.");
            return;
        }

        if (totalEq <= 0) {
            alert("Rezerv tüm birlikleri ayırdığı için bu tur rezervi yok sayıyorum.");
            totalEq = rawEq;
            Object.assign(available, rawAvailable);
        }

        const weights = { 4: 15, 3: 6, 2: 3, 1: 2 };
        const sumW = 26;
        const pool = Object.assign({}, available);
        const allocations = { 1: {}, 2: {}, 3: {}, 4: {} };

        function allocate(level) {
            let needEq = totalEq * (weights[level] / sumW);

            for (let u of activeUnits) {
                let eq = unitCaps[u] / spearCap;
                let avail = pool[u] || 0;
                if (!avail || !eq) continue;

                let take = Math.min(avail, Math.floor(needEq / eq));
                if (take > 0) {
                    allocations[level][u] = (allocations[level][u] || 0) + take;
                    pool[u] -= take;
                    needEq -= take * eq;
                }
            }

            for (let u of activeUnits) {
                if (needEq <= 0) break;
                if (pool[u] > 0) {
                    allocations[level][u] = (allocations[level][u] || 0) + 1;
                    pool[u]--;
                    needEq -= (unitCaps[u] / spearCap);
                }
            }
        }

        [4, 3, 2, 1].forEach(allocate);

        window.SCAV_PLAN = {
            allocations,
            activeUnits,
            remaining: [4, 3, 2, 1],
            unitInputs
        };
    }

    const state = window.SCAV_PLAN;
    const level = state.remaining.shift();
    const alloc = state.allocations[level];

    state.activeUnits.forEach(u => {
        const val = alloc[u] || 0;
        const inp = document.getElementById(state.unitInputs[u]);
        if (inp) {
            inp.value = val;
            inp.dispatchEvent(new Event("input", { bubbles: true }));
            inp.dispatchEvent(new Event("change", { bubbles: true }));
        }
    });

    alert("Seviye " + level + " için birlikler yerleştirildi.\nKartta BAŞLA tuşuna bas.");

    if (!state.remaining.length) window.SCAV_PLAN = null;
}
