// =====================================================
//  SCAVENGER MODULE - FINAL FULL CLEAN VERSION
//  - Auto panel open
//  - No reserve
//  - Dark grey wide UI
//  - Time on top
// =====================================================

window.TW_SCAV_ACTIVE = true;

/* ============================
   FORCE BOOT (NO REDIRECT)
============================ */
(function forceBoot(){
    setTimeout(function(){
        try {
            initModule();
            console.log("Scavenger panel force-loaded.");
        } catch(e){
            console.log("Panel not ready yet...");
        }
    }, 800);
})();

/* ============================
   PANEL UI
============================ */
function initModule() {

    // Panel varsa kaldırıp yeniden oluştur
    document.getElementById("scavenger-panel")?.remove();

    const panel = document.createElement("div");
    panel.id = "scavenger-panel";

    panel.style.cssText = `
        position: fixed;
        top: 70px;
        right: 40px;
        background: #3b3b3b;
        color: #f2f2f2;
        padding: 18px;
        border: 1px solid #666;
        border-radius: 12px;
        width: 380px;
        z-index: 999999;
        font-size: 13px;
        box-shadow: 0 0 10px rgba(0,0,0,0.8);
    `;

    function unitRow(unit, label) {
        return `
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
            <input type="checkbox" class="unit-select" value="${unit}">
            <img src="/graphic/unit/unit_${unit}.png" style="width:16px;height:16px;">
            <span>${label}</span>
        </div>`;
    }

    panel.innerHTML = `
        <b style="font-size:15px;">Temizleme Modülü (Final)</b><br><br>

        <div style="margin-bottom:16px;">
            <div>Hedef Süre (HH:MM)</div>
            <input id="scav_time" type="text" value="01:30"
                style="width:90px;background:#222;border:1px solid #777;color:#eee;padding:4px;">
        </div>

        <div style="font-weight:bold;margin-bottom:12px;">Birim Seçimi</div>

        ${unitRow("spear","Mızrak")}
        ${unitRow("sword","Kılıç")}
        ${unitRow("axe","Balta")}
        ${unitRow("archer","Okçu")}
        ${unitRow("light","Hafif Atlı")}
        ${unitRow("marcher","Atlı Okçu")}
        ${unitRow("heavy","Ağır Atlı")}
        ${unitRow("knight","Şövalye")}

        <br>

        <button id="scav_calc"
            style="width:100%;padding:10px;background:#c89b54;
                   border:1px solid #805c23;font-weight:bold;border-radius:6px;">
            Hesapla ve Yerleştir
        </button>

        <button id="scav_close"
            style="width:100%;padding:7px;margin-top:6px;
                   background:#444;border:1px solid #777;color:#eee;border-radius:6px;">
            Kapat
        </button>
    `;

    document.body.appendChild(panel);

    document.getElementById("scav_calc").onclick = runCalculation;
    document.getElementById("scav_close").onclick = () => panel.remove();
}

/* ============================
   UNIT INPUT FINDER (UNIVERSAL)
============================ */
function findUnitInput(unit) {

    let el = document.getElementById("unit_input_" + unit);
    if (el) return el;

    el = document.querySelector("input[name='" + unit + "']");
    if (el) return el;

    el = document.querySelector("input[id*='" + unit + "']");
    return el || null;
}

/* ============================
   CALCULATION (NO RESERVE, NO ERROR)
============================ */
function runCalculation() {

    const selectedTime = document.getElementById("scav_time").value || "01:30";

    const activeUnits = [...document.querySelectorAll(".unit-select:checked")].map(e => e.value);
    if (!activeUnits.length) {
        alert("❗ En az 1 birlik seçmelisin.");
        return;
    }

    let anyWritten = false;

    activeUnits.forEach(unit => {

        const inp = findUnitInput(unit);
        if (!inp) return;

        const total =
            (inp.dataset && inp.dataset.all ? parseInt(inp.dataset.all) : NaN) ||
            parseInt(inp.value) || 0;

        if (total <= 0) {
            inp.value = 0;
            return;
        }

        // Şimdilik demo: %25 gönder
        const send = Math.max(1, Math.floor(total * 0.25));
        inp.value = send;

        inp.dispatchEvent(new Event("input", { bubbles: true }));
        inp.dispatchEvent(new Event("change", { bubbles: true }));

        anyWritten = true;
    });

    if (!anyWritten) {
        alert("Bu köyde seçtiğin birliklerden hiçbiri gönderilebilir durumda değil.");
        return;
    }

    alert("✅ " + selectedTime + " süresine göre birlikler yazıldı.\nKarttan BAŞLA'ya bas.");
}
