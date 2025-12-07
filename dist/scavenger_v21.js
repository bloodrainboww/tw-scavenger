// ==========================================
//  TEMIZLEME PANELI v2.1
//  OKUMA + HESAPLAMA + ENTER ILE YAZMA
//  BloodRainBoww x ChatGPT
//  (TIKLAMA YOK - GONDERME YOK)
// ==========================================

(function () {
    "use strict";

    console.log("✅ Scavenger v2.1 Core Loaded");

    // -----------------------------
    //  TEMİZLEME EKRANINA YÖNLENDİR
    // -----------------------------
    if (!location.href.includes("screen=place") || !location.href.includes("mode=scavenge")) {
        const village = (location.search.match(/village=(\d+)/) || [])[1];
        if (village) {
            location.href = `/game.php?village=${village}&screen=place&mode=scavenge`;
            return;
        }
    }

    // -----------------------------
    //  PANEL OLUŞTUR
    // -----------------------------
    if (document.getElementById("tw_scav_panel")) return;

    const panel = document.createElement("div");
    panel.id = "tw_scav_panel";
    panel.style.cssText = `
        position: fixed;
        top: 80px;
        right: 30px;
        width: 320px;
        background: #2b2b2b;
        color: #fff;
        padding: 12px;
        border-radius: 10px;
        font-size: 13px;
        z-index: 99999;
        box-shadow: 0 0 10px black;
    `;

    panel.innerHTML = `
        <div style="text-align:center;font-weight:bold;font-size:15px;">
            Temizleme Paneli v2.1
        </div>

        <div style="margin-top:10px;text-align:center;">
            Süre (HH:MM)
            <input id="tw_time" value="01:30" style="width:70px;text-align:center;">
        </div>

        <div id="tw_units" style="margin-top:10px;"></div>

        <button id="tw_calc" style="
            width:100%;
            margin-top:10px;
            padding:6px;
            background:#4caf50;
            border:0;
            color:white;
            border-radius:6px;
            cursor:pointer;">
            Hesapla & ENTER ile Yaz
        </button>

        <div style="margin-top:8px;font-size:10px;opacity:0.6;text-align:right;">
            BloodRainBoww x ChatGPT
        </div>
    `;

    document.body.appendChild(panel);

    // -----------------------------
    //  BİRİM OKUMA
    // -----------------------------
    const UNIT_CAP = {
        spear: 25,
        sword: 15,
        axe: 10,
        archer: 18,
        light: 80,
        marcher: 50,
        heavy: 50,
        knight: 100
    };

    function readVillageUnits() {
        const result = {};
        document.querySelectorAll(".units-entry-all").forEach(el => {
            const u = el.dataset.unit;
            const v = parseInt(el.textContent.replace(/\D/g, ""));
            if (!isNaN(v)) result[u] = v;
        });
        return result;
    }

    // -----------------------------
    //  PANEL BİRİM LİSTESİ
    // -----------------------------
    const unitBox = document.getElementById("tw_units");
    const villageUnits = readVillageUnits();

    Object.keys(villageUnits).forEach(u => {
        if (!UNIT_CAP[u]) return;
        const row = document.createElement("div");
        row.style.cssText = "display:flex;justify-content:space-between;margin-bottom:4px;";
        row.innerHTML = `
            <label>
                <input type="checkbox" data-unit="${u}" checked> ${u}
            </label>
            <span>${villageUnits[u]}</span>
        `;
        unitBox.appendChild(row);
    });

    // -----------------------------
    //  SÜRE → KAPASİTE HESAP
    // -----------------------------
    function calcCapacityByTime(sec) {
        return Math.round(Math.sqrt((sec / 0.7722074897 - 1800)) / 10);
    }

    // -----------------------------
    //  ENTER DÖNGÜSÜ
    // -----------------------------
    let enterStep = 0;

    function writeNext() {
        const time = document.getElementById("tw_time").value;
        const [h, m] = time.split(":").map(Number);
        const sec = h * 3600 + m * 60;
        const cap = calcCapacityByTime(sec);

        const selectedUnits = {};
        document.querySelectorAll("#tw_units input:checked").forEach(cb => {
            const u = cb.dataset.unit;
            selectedUnits[u] = villageUnits[u];
        });

        const order = ["scavenger_0", "scavenger_1", "scavenger_2", "scavenger_3"];
        const slot = order[enterStep % 4];
        const block = document.getElementById(slot);
        if (!block) return alert("Temizleme kutusu bulunamadı");

        for (const unit in selectedUnits) {
            const input = block.querySelector(`input[name='${unit}']`);
            if (!input) continue;
            const need = Math.floor(cap / UNIT_CAP[unit]);
            input.value = Math.min(need, selectedUnits[unit]);
            break;
        }

        enterStep++;
    }

    document.getElementById("tw_calc").onclick = () => {
        alert("ENTER ile sırayla yazabilirsin.");
    };

    document.addEventListener("keydown", e => {
        if (e.key === "Enter") writeNext();
    });

})();
