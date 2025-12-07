// =====================================================
//  TRIBAL WARS - TEMİZLEME MODÜLÜ (BASİT, REZERVSİZ)
//  bloodrainboww / tw-scavenger / scavenger_final_v1
// -----------------------------------------------------
//  - Sadece temizleme (scavenge) ekranında çalışır
//  - Hafif bej panel (eski hissiyat)
//  - Süre alanı üstte (şimdilik bilgi amaçlı)
//  - Rezerv YOK (sade)
//  - Seçilen birimlerin %25'ini yazar (demo)
//  - Hiç illegal tıklama yok, sadece input value değiştiriyor
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
        top: 80px;
        right: 40px;
        background: #f8f4e8;
        color: #000;
        padding: 10px;
        border: 2px solid #b28c4f;
        border-radius: 10px;
        width: 260px;
        z-index: 99999;
        font-size: 13px;
    `;

    function unitRow(unit, label) {
        return `
        <label style="display:block;margin-bottom:3px;">
            <input type="checkbox" class="scav-unit-select" value="${unit}">
            ${label}
        </label>`;
    }

    panel.innerHTML = `
        <b style="font-size:14px;">Temizleme Modülü (Basit)</b><br><br>

        Süre (HH:MM):<br>
        <input id="scav_time" type="text" value="01:30" style="width:80px;"><br><br>

        <b>Birim Seçimi</b><br>
        ${unitRow("spear","Mızrakçı")}
        ${unitRow("sword","Kılıç")}
        ${unitRow("axe","Balta")}
        ${unitRow("archer","Okçu")}
        ${unitRow("light","Hafif Atlı")}
        ${unitRow("marcher","Atlı Okçu")}
        ${unitRow("heavy","Ağır Atlı")}
        ${unitRow("knight","Şövalye")}
        <br>

        <button id="scav_calc_btn"
            style="width:100%;padding:5px;background:#d2b48c;border:1px solid #8b6a3c;">
            Hesapla ve Yerleştir
        </button><br><br>

        <button id="scav_close_btn"
          style="width:100%;padding:5px;">
          Kapat
        </button>
    `;

    document.body.appendChild(panel);

    document.getElementById("scav_close_btn").onclick = () => panel.remove();
    document.getElementById("scav_calc_btn").onclick = runCalculation;

    // ---------- BİRİM INPUT BUL ----------
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
            if (!inp) return; // bu birlik yoksa sessiz geç

            const total =
                (inp.dataset && inp.dataset.all ? parseInt(inp.dataset.all) : NaN) ||
                parseInt(inp.value) || 0;

            if (!total || total <= 0) {
                inp.value = 0;
                return;
            }

            // ŞİMDİLİK DEMO: toplamın %25'ini gönder
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

        alert("✅ " + timeStr + " için birlikler yazıldı.\nKarttan BAŞLA'ya bas.");
    }

    console.log("✅ Basit scavenger modülü yüklendi ve panel açıldı.");

})();
