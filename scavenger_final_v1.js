// =====================================================
//  SCAVENGER MODULE - TRIBAL WARS CLEAN SCAVENGING TOOL
//  FINAL VERSION - Single Input / Sequential Fill (4→3→2→1)
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
// PANEL UI
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
        background: #fff7e1;
        padding: 12px;
        border: 2px solid #b28c4f;
        border-radius: 10px;
        width: 250px;
        z-index: 99999;
        font-size: 13px;
        box-shadow: 0 0 5px rgba(0,0,0,0.4);
    `;

    panel.innerHTML = `
        <b style="font-size:14px;">Temizleme Modülü (Final v1)</b><br><br>

        Süre (HH:MM):<br>
        <input id="scav_time" type="text" value="01:07" style="width:80px;"><br><br>

        <b>Birim Seçimi</b><br>
        <label><input type="checkbox" class="unit-select" value="spear" checked> Mızrakçı</label><br>
        <label><input type="checkbox" class="unit-select" value="sword"> Kılıç</label><br>
        <label><input type="checkbox" class="unit-select" value="axe"> Balta</label><br>
        <label><input type="checkbox" class="unit-select" value="archer"> Okçu</label><br><br>

        Rezerv (ayır):<br>
        <input id="reserve" type="number" value="0" style="width:80px;"><br><br>

        <button id="scav_calc" style="width:100%;padding:6px;background:#d2b48c;border:1px solid #8b6a3c;">
            Hesapla ve Yerleştir
        </button><br><br>

        <button onclick="document.getElementById('scavenger-panel').style.display='none'"
          style="width:100%;padding:5px;">
          Kapat
        </button>
    `;

    document.body.appendChild(panel);

    document.getElementById("scav_calc").onclick = runCalculation;

    console.log("%c[Scavenger Final v1] Module Loaded", "color:green;font-weight:bold;");
}

// =====================================================
//  PLAN HESAPLAMA (4 → 3 → 2 → 1)
// =====================================================

window.SCAV_PLAN = null;

function runCalculation() {

    const reserve = parseInt(document.getElementById("reserve").value) || 0;

    const unitInputs = {
        spear: "unit_input_spear",
        sword: "unit_input_sword",
        axe: "unit_input_axe",
        archer: "unit_input_archer"
    };

    const unitCaps = {
        spear: 25,
        sword: 15,
        axe: 10,
        archer: 18
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

        // Köydeki mevcut birlikleri oku
        activeUnits.forEach(unit => {
            const el = document.getElementById(unitInputs[unit]);
            if (!el) return;

            const raw = parseInt(el.dataset.all) || parseInt(el.value) || 0;
            const usable = Math.max(raw - reserve, 0);
            available[unit] = usable;

            totalEq += usable * (unitCaps[unit] / spearCap);
        });

        if (totalEq <= 0) {
            alert("Rezerv sonrası birlik kalmadı.");
            return;
        }

        // 650 mızrak örneğine göre oran seti:
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
                if (avail <= 0) continue;

                let take = Math.min(avail, Math.floor(needEq / eq));
                if (take > 0) {
                    allocations[level][u] = (allocations[level][u] || 0) + take;
                    pool[u] -= take;
                    needEq -= take * eq;
                }
            }

            // bitmediyse 1'er 1'er tamamla
            for (let u of order) {
                if (needEq <= 0) break;
                let avail = pool[u] || 0;
                if (avail <= 0) continue;
                allocations[level][u] = (allocations[level][u] || 0) + 1;
                pool[u] -= 1;
                needEq -= (unitCaps[u] / spearCap);
            }
        }

        // Sırayla hesapla
        [4, 3, 2, 1].forEach(allocate);

        window.SCAV_PLAN = {
            allocations: allocations,
            activeUnits: activeUnits,
            remaining: [4, 3, 2, 1],
            unitInputs: unitInputs
        };
    }

    // Burada sıradaki seviyeyi dolduruyoruz
    const state = window.SCAV_PLAN;
    const level = state.remaining.shift();
    const alloc = state.allocations[level];

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
}
