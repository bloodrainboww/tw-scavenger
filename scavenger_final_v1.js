// =====================================================
//  SCAVENGER MODULE - FINAL (NO RESERVE, STABLE)
//  - Koyu gri geniş panel
//  - Süre alanı üstte
//  - Rezerv yok
//  - "Birlik yok" hatası yok (sadece varsa yazar, yoksa sessiz)
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
    setTimeout(() => initModule(), 400);
}

/* ============================
   PANEL UI - DARK GREY + WIDE
============================ */
function initModule() {

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
        z-index: 99999;
        font-size: 13px;
        box-shadow: 0 0 10px rgba(0,0,0,0.8);
    `;

    function unitRow(unit, label) {
        return `
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
            <input type="checkbox" class="unit-select" value="${unit}">
            <img src="/graphic/unit/unit_${unit}.png" style="width:16px;height:16px;">
            <span>${label}</span>
        </div>`;
    }

    panel.innerHTML = `
        <b style="font-size:15px;">Temizleme Modülü (Rezervsiz Final)</b><br><br>

        <!-- SÜRE -->
        <div style="margin-bottom:14px;">
            <div>Hedef Süre (HH:MM)</div>
            <input id="scav_time" type="text" value="01:30"
                style="width:90px;background:#222;border:1px solid #777;color:#eee;padding:4px;">
        </div>

        <div style="font-weight:bold;margin-bottom:10px;">Birim Seçimi</div>

        ${unitRow("spear","Mızrak")}
        ${unitRow("sword","Kılıç")}
        ${unitRow("axe","Balta")}
        ${unitRow("archer","Okçu")}
        ${unitRow("light","Hafif Atlı")}
        ${unitRow("marcher","Atlı Okçu")}
        ${unitRow("heavy","Ağır Atlı")}
        ${unitRow("knight","Şövalye")}

        <br>

        <!-- BUTON EN ALTA -->
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
   YARDIMCI: BİRİM INPUT'UNU BUL
   (ID TUTMAZSA name='spear' vs. ile yakalar)
============================ */
function findUnitInput(unit) {
    // En yaygın id formatı
    let el = document.getElementById("unit_input_" + unit);
    if (el) return el;

    // Bazı dünyalarda sadece name kullanılıyor
    el = document.querySelector("input[name='" + unit + "']");
    if (el) return el;

    // Son çare: id içinde unit geçen input
    el = document.querySelector("input[id*='" + unit + "']");
    return el || null;
}

/* ============================
   HESAPLAMA - REZERV YOK, HATA YOK
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
        if (!inp) return; // o birlik bu dünyada / ekranda yoksa sessizce geç

        const total =
            (typeof inp.dataset.all !== "undefined" ? parseInt(inp.dataset.all) : NaN) ||
            parseInt(inp.value) || 0;

        if (total <= 0) {
            // bu birimde asker yoksa 0 yazar geçer, hata vermez
            inp.value = 0;
            return;
        }

        // ŞİMDİLİK: basit demo – %25'ini yaz
        // Sonradan burayı gerçek süre/kapasite mantığıyla değiştireceğiz.
        const send = Math.max(1, Math.floor(total * 0.25));
        inp.value = send;
        inp.dispatchEvent(new Event("input", { bubbles: true }));
        inp.dispatchEvent(new Event("change", { bubbles: true }));
        anyWritten = true;
    });

    if (!anyWritten) {
        alert("Seçtiğin birimlerde yazılacak asker bulunamadı (hepsi 0 olabilir).");
        return;
    }

    alert("✅ " + selectedTime + " için birlikler yazıldı.\nKarttan BAŞLA'ya bas.");
}
