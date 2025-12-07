// =====================================================
//  SCAVENGER MODULE - TRIBAL WARS CLEAN SCAVENGING TOOL
//  FINAL VERSION - Single Input / Sequential Fill (4→3→2→1)
//  Dark mode + extra units + per-unit reserve
// =====================================================

// Global flag to avoid double loading
window.TW_SCAV_ACTIVE = true;

// ----------------------------------------------
// AUTO BOOT FOR BOOKMARKLET
// ----------------------------------------------
window.__SCAVENGER_BOOT = function () {

    // If already on scavenge screen → load panel
    if (location.href.includes("screen=place") && location.href.includes("mode=scavenge")) {
        initModule();
        return;
    }

    // Otherwise redirect
    const villageMatch = location.href.match(/village=(\d+)/);
    const villageId = villageMatch ? villageMatch[1] : null;
    if (!villageId) {
        alert("Köy ID bulunamadı.");
        return;
    }

    location.href = `/game.php?village=${villageId}&screen=place&mode=scavenge&scav_start=1`;
};

// ----------------------------------------------
// AUTO START after redirect
// ----------------------------------------------
if (location.search.includes("scav_start=1")) {
    setTimeout(() => initModule(), 300);
}

// ----------------------------------------------
// PANEL UI (DARK MODE + EXTRA UNITS + PER-UNIT RESERVE)
// ----------------------------------------------
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
        width: 280px;
        z-index: 99999;
        font-size: 13px;
        box-shadow: 0 0 8px rgba(0,0,0,0.7);
    `;

    panel.innerHTML = `
        <div style="font-size:14px;font-weight:bold;margin-bottom:6px;">
            Temizleme Modülü (Final v1)
        </div>

        <div style="margin-bottom:8px;">
            <div style="margin-bottom:3px;">Süre (HH:MM):</div>
            <input id="scav_time" type="text" value="01:07"
                   style="width:80px;padding:3px;background:#222;border:1px solid #555;color:#eee;">
        </div>

        <div style="font-weight:bold;margin-bottom:4px;">Birim Seçimi</div>

        <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:8px;">

            <div style="display:flex;align-items:center;justify-content:space-between;gap:4px;">
                <label style="display:flex;align-items:center;gap:4px;">
                    <input type="checkbox" class="unit-select" value="spear" checked>
                    <img src="/graphic/unit/unit_spear.png" alt="" style="width:16px;height:16px;">
                    <span>Mızrakçı</span>
                </label>
                <input id="reserve_spear" type="number" value="0" min="0"
                       style="width:60px;padding:2px;background:#222;border:1px solid #555;color:#eee;"
                       title="Mızrakçı rezerv">
            </div>

            <div style="display:flex;align-items:center;justify-content:space-between;gap:4px;">
                <label style="display:flex;align-items:center;gap:4px;">
                    <input type="checkbox" class="unit-select" value="sword">
                    <img src="/graphic/unit/unit_sword.png" alt="" style="width:16px;height:16px;">
                    <span>Kılıç</span>
                </label>
                <input id="reserve_sword" type="number" value="0" min="0"
                       style="width:60px;padding:2px;background:#222;border:1px solid #555;color:#eee;"
                       title="Kılıç rezerv">
            </div>

            <div style="display:flex;align-items:center;justify-content:space-between;gap:4px;">
                <label style="display:flex;align-items:center;gap:4px;">
                    <input type="checkbox" class="unit-select" value="axe">
                    <img src="/graphic/unit/unit_axe.png" alt="" style="width:16px;height:16px;">
                    <span>Balta</span>
                </label>
                <input id="reserve_axe" type="number" value="0" min="0"
                       style="width:60px;padding:2px;background:#222;border:1px solid #555;color:#eee;"
                       title="Balta rezerv">
            </div>

            <div style="display:flex;align-items:center;justify-content:space-between;gap:4px;">
                <label style="display:flex;align-items:center;gap:4px;">
                    <input type="checkbox" class="unit-select" value="archer">
                    <img src="/graphic/unit/unit_archer.png" alt="" style="width:16px;height:16px;">
                    <span>Okçu</span>
                </label>
                <input id="reserve_archer" type="number" value="0" min="0"
                       style="width:60px;padding:2px;background:#222;border:1px solid #555;color:#eee;"
                       title="Okçu rezerv">
            </div>

            <div style="display:flex;align-items:center;justify-content:space-between;gap:4px;">
                <label style="display:flex;align-items:center;gap:4px;">
                    <input type="checkbox" class="unit-select" value="light">
                    <img src="/graphic/unit/unit_light.png" alt="" style="width:16px;height:16px;">
                    <span>Hafif Atlı</span>
                </label>
                <input id="reserve_light" type="number" value="0" min="0"
                       style="width:60px;padding:2px;background:#222;border:1px solid #555;color:#eee;"
                       title="Hafif atlı rezerv">
            </div>

            <div style="display:flex;align-items:center;justify-content:space-between;gap:4px;">
                <label style="display:flex;align-items:center;gap:4px;">
                    <input type="checkbox" class="unit-select" value="marcher">
                    <img src="/graphic/unit/unit_marcher.png" alt="" style="width:16px;height:16px;">
                    <span>Atlı Okçu</span>
                </label>
                <input id="reserve_marcher" type="number" value="0" min="0"
                       style="width:60px;padding:2px;background:#222;border:1px solid #555;color:#eee;"
                       title="Atlı okçu rezerv">
            </div>

            <div style="display:flex;align-items:center;justify-content:space-between;gap:4px;">
                <label style="display:flex;align-items:center;gap:4px;">
                    <input type="checkbox" class="unit-select" value="heavy">
                    <img src="/graphic/unit/unit_heavy.png" alt="" style="width:16px;height:16px;">
                    <span>Ağır Atlı</span>
                </label>
                <input id="reserve_heavy" type="number" value="0" min="0"
                       style="width:60px;padding:2px;background:#222;border:1px solid #555;color:#eee;"
                       title="Ağır atlı rezerv">
            </div>

            <div style="display:flex;align-items:center;justify-content:space-between;gap:4px;">
                <label style="display:flex;align-items:center;gap:4px;">
                    <input type="checkbox" class="unit-select" value="knight">
                    <img src="/graphic/unit/unit_knight.png" alt="" style="width:16px;height:16px;">
                    <span>Şövalye</span>
                </label>
                <input id="reserve_knight" type="number" value="0" min="0"
                       style="width:60px;padding:2px;background:#222;border:1px solid #555;color:#eee;"
                       title="Şövalye rezerv">
            </div>

        </div>

        <button id="scav_calc"
                style="width:100%;padding:6px;margin-bottom:6px;background:#c89b54;border:1px solid #805c23;color:#111;font-weight:bold;">
            Hesapla ve Yerleştir
        </button>

        <button id="scav_close"
                style="width:100%;padding:5px;background:#333;border:1px solid #555;color:#eee;">
            Kapat
        </button>
    `;

    document.body.appendChild(panel);

    document.getElementById("scav_calc").onclick = runCalculation;
    document.getElementById("scav_close").onclick = function () {
        panel.style.display = "none";
    };

    console.log("%c[Scavenger Final v1] Module Loaded", "color:lime;font-weight:bold;");
}

// =====================================================
//  PLAN HESAPLAMA (4 → 3 → 2 → 1, tek input)
// =====================================================

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
    if (activeUnits.length === 0) {
        alert("En az bir birlik seçmelisin.");
        return;
    }

    // Yeni plan gerekli mi?
    if (!window.SCAV_PLAN || !window.SCAV_PLAN.remaining || window.SCAV_PLAN.remaining.length === 0) {

        const available = {};
        let totalEq = 0;
        const spearCap = unitCaps.spear;

        activeUnits.forEach(unit => {
            const inputId = unitInputs[unit];
            const el = document.getElementById(inputId);
            if (!el) return;

            const raw = parseInt(el.dataset.all) || parseInt(el.value) || 0;

            const reserveInput = document.getElementById("reserve_" + unit);
            const reserveVal = reserveInput ? (parseInt(reserveInput.value) || 0) : 0;

            const usable = Math.max(raw - reserveVal, 0);
            available[unit] = usable;

            totalEq += usable * (unitCaps[unit] / spearCap);
        });

        if (totalEq <= 0) {
            alert("Rezerv sonrası birlik kalmadı.");
            return;
        }

        // 650 mızrak örneğine göre ağırlık seti (4:15, 3:6, 2:3, 1:2)
        const weights = { 4: 15, 3: 6, 2: 3, 1: 2 };
        const sumW = 15 + 6 + 3 + 2;

        const pool = {};
        Object.keys(available).forEach(k => pool[k] = available[k]);

        const allocations = { 1: {}, 2: {}, 3: {}, 4: {} };

        function allocate(level) {
            let needEq = totalEq * (weights[level] / sumW);
            const order = activeUnits;

            for (let u of order) {
                let eq = unitCaps[u] / spearCap;
                let avail = pool[u] || 0;
                if (avail <= 0 || eq <= 0) continue;

                let take = Math.min(avail, Math.floor(needEq / eq));
                if (take > 0) {
                    allocations[level][u] = (allocations[level][u] || 0) + take;
                    pool[u] -= take;
                    needEq -= take * eq;
                }
            }

            // hala eksikse 1'er 1'er doldur
            for (let u of order) {
                if (needEq <= 0) break;
                let avail = pool[u] || 0;
                if (avail <= 0) continue;
                allocations[level][u] = (allocations[level][u] || 0) + 1;
                pool[u] -= 1;
                needEq -= (unitCaps[u] / spearCap);
            }
        }

        [4, 3, 2, 1].forEach(allocate);

        window.SCAV_PLAN = {
            allocations: allocations,
            activeUnits: activeUnits,
            remaining: [4, 3, 2, 1],
            unitInputs: unitInputs
        };
    }

    // Sıradaki seviye için tek satırı doldur
    const state = window.SCAV_PLAN;
    const level = state.remaining.shift(); // 4 → 3 → 2 → 1
    const alloc = state.allocations[level] || {};

    state.activeUnits.forEach(u => {
        const val = alloc[u] || 0;
        const id = state.unitInputs[u];
        const inp = document.getElementById(id);
        if (inp) {
            inp.value = val;
            inp.dispatchEvent(new Event("input", { bubbles: true }));
            inp.dispatchEvent(new Event("change", { bubbles: true }));
        }
    });

    alert("Seviye " + level + " için birlikler yerleştirildi.\nKartta BAŞLA tuşuna bas.");

    // Tüm seviyeler bittiğinde planı sıfırla
    if (!state.remaining.length) {
        window.SCAV_PLAN = null;
    }
}
