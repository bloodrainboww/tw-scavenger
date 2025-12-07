// =====================================================
//  SCAVENGER MODULE - CLEAN, SAFE, LEGAL
//  Version: FINAL v1
//  Auto-redirect, auto-open, no illegal clicks
// =====================================================

// GLOBAL FLAG
window.TW_SCAV_ACTIVE = true;

// Boot method for bookmarklet
window.__SCAVENGER_BOOT = function () {
    // If already on the screen → load UI
    if (location.href.includes("screen=place") && location.href.includes("mode=scavenge")) {
        initModule();
    } else {
        // Redirect safely
        const villageMatch = location.href.match(/village=(\d+)/);
        const villageId = villageMatch ? villageMatch[1] : null;
        if (!villageId) {
            alert("Köy ID bulunamadı.");
            return;
        }
        location.href = `/game.php?village=${villageId}&screen=place&mode=scavenge&scav_module_start=1`;
    }
};

// AUTO-START AFTER REDIRECT
if (location.search.includes("scav_module_start=1")) {
    setTimeout(() => initModule(), 500);
}

// ----------------------------------------------------
// UI MODULE
// ----------------------------------------------------
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
        background: #f8f4e8;
        padding: 10px;
        border: 2px solid #b28c4f;
        border-radius: 10px;
        width: 260px;
        z-index: 999999;
        font-size: 13px;
    `;

    panel.innerHTML = `
        <b style="font-size:14px;">Temizleme Modülü (Final v1)</b><br><br>

        Süre (HH:MM): <br>
        <input id="scav_time" type="text" value="01:30" style="width:80px;"><br><br>

        <b>Birim Seçimi</b><br>
        <label><input type="checkbox" class="unit-select" value="spear" checked> Mızrakçı</label><br>
        <label><input type="checkbox" class="unit-select" value="sword"> Kılıç</label><br>
        <label><input type="checkbox" class="unit-select" value="axe"> Balta</label><br>
        <label><input type="checkbox" class="unit-select" value="archer"> Okçu</label><br><br>

        Rezerv (ayır):<br>
        <input id="reserve" type="number" value="0" style="width:60px;"><br><br>

        <button id="scav_calc" style="width:100%;padding:5px;background:#d2b48c;border:1px solid #8b6a3c;">
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

// ----------------------------------------------------
// CALCULATION LOGIC
// ----------------------------------------------------
function runCalculation() {
    const time = document.getElementById("scav_time").value;
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

    const activeUnits = [...document.querySelectorAll(".unit-select:checked")].map(e=>e.value);

    let totalCap = 0;
    let unitsLeft = {};

    activeUnits.forEach(unit => {
        const el = document.getElementById(unitInputs[unit]);
        if (!el) return;

        const available = parseInt(el.dataset.all) || parseInt(el.value) || 0;
        const usable = Math.max(available - reserve, 0);

        unitsLeft[unit] = usable;
        totalCap += usable * unitCaps[unit];
    });

    const capL1 = 0.10 * totalCap;
    const capL2 = 0.25 * totalCap;
    const capL3 = 0.50 * totalCap;
    const capL4 = 0.75 * totalCap;

    fillLevel("scavenger_3", capL1, unitCaps, unitsLeft); // L1
    fillLevel("scavenger_2", capL2, unitCaps, unitsLeft); // L2
    fillLevel("scavenger_1", capL3, unitCaps, unitsLeft); // L3
    fillLevel("scavenger_0", capL4, unitCaps, unitsLeft); // L4

    alert("Dağıtım tamamlandı!");
}

function fillLevel(id, needCap, caps, units) {
    const block = document.getElementById(id);
    if (!block) return;

    for (let unit in units) {
        if (units[unit] <= 0) continue;

        const input = block.querySelector(`input[name='${unit}']`);
        if (!input) continue;

        const cap = caps[unit];
        const max = Math.min(units[unit], Math.floor(needCap / cap));

        input.value = max;
        needCap -= max * cap;
        units[unit] -= max;

        if (needCap <= 0) break;
    }
}
