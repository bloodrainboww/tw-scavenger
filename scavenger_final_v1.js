// =====================================================
//  TRIBAL WARS - TEMİZLEME MODÜLÜ (BASİT, REZERVSİZ)
//  bloodrainboww / tw-scavenger / scavenger_final_v1
// -----------------------------------------------------
//  - Sadece temizleme (scavenge) ekranında çalışır
//  - Koyu gri, geniş panel
//  - Süre alanı üstte (şimdilik sadece bilgi amaçlı)
//  - Rezerv yok
//  - Seçili birimlerin %25'ini kutulara yazar (DEMO)
//  - Hiç illegal tıklama yok, sadece input değerini değiştirir
// =====================================================

(function () {

    // ---------- SADECE TEMİZLEME EKRANINDA ÇALIŞSIN ----------
    if (!location.href.includes("screen=place") || !location.href.includes("mode=scavenge")) {
        alert("Önce temizleme (çapulcu) ekranına gir, sonra kısayolu çalıştır.");
        return;
    }

    // Eski panel varsa temizle
    const old = document.getElementById("scavenger-panel");
    if (old) old.remove();

    // ---------- PANEL UI ----------
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
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
            <input type="checkbox" class="scav-unit-select" value="${unit}">
            <img src="/graphic/unit/unit_${unit}.png" style="width:16px;height:16px;">
            <span>${label}</span>
        </div>`;
    }

    panel.innerHTML = `
        <b style="font-size:15px;">Temizleme Modülü (Basit Sürüm)</b><br><br>

        <div style="margin-bottom:16px;">
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

        <button id="scav_calc_btn"
            style="width:100%;padding:10px;background:#c89b54;
                   border:1px solid #805c23;font-weight:bold;border-radius:6px;">
            Hesapla ve Yerleştir
        </button>

        <button id="scav_close_btn"
            style="width:100%;padding:7px;margin-top:6px;
                   background:#444;border:1px solid #777;color:#eee;border-radius:6px;">
            Kapat
        </button>
    `;

    document.body.appendChild(panel);

    document.getElementById("scav_close_btn").onclick = () => panel.remove();
    document.getElementById("scav_calc_btn").onclick = runCalculation;

    // ---------- YARDIMCI: BİRİM INPUT BUL ----------
    function findUnitInput(unit) {
        // En yaygın id: unit_input_spear vs.
        let el = document.getElementById("unit_input_" + unit);
        if (el) return el;

        // Bazı dünyalarda name="spear"
        el = document.querySelector("input[name='" + unit + "']");
        if (el) return el;

        // Son çare: id içinde unit ismi geçen input
        el = document.querySelector("input[id*='" + unit + "']");
        return el || null;
    }

    // ---------- HESAPLAMA ----------
    function runCalculation() {
        const timeStr = document.getElementById("scav_time").value || "01:30";

        const activeUnits = [...document.querySelectorAll(".scav-unit-select:checked")].map(e => e.value);
        if (!activeUnits.length) {
            alert("En az bir birlik seçmelisin.");
            return;
        }

        let wroteAny = false;

        activeUnits.forEach(unit => {
            const inp = findUnitInput(unit);
            if (!inp) return; // bu birlik yoksa sessizce geç

            const total =
                (inp.dataset && inp.dataset.all ? parseInt(inp.dataset.all) : NaN) ||
                parseInt(inp.value) || 0;

            if (!total || total <= 0) {
                inp.value = 0;
                return;
            }

            // 💡 Şimdilik DEMO: %25'ini yazıyoruz
            // Sonra süre + kapasite matematiğini buraya koyarız.
            const send = Math.max(1, Math.floor(total * 0.25));
            inp.value = send;

            inp.dispatchEvent(new Event("input", { bubbles: true }));
            inp.dispatchEvent(new Event("change", { bubbles: true }));

            wroteAny = true;
        });

        if (!wroteAny) {
            alert("Seçtiğin birliklerde gönderilecek asker bulunamadı.");
            return;
        }

        alert("✅ " + timeStr + " süresi için birlikler yazıldı.\nKarttan BAŞLA'ya bas.");
    }

    console.log("✅ Scavenger modül yüklendi ve panel açıldı.");

})();
