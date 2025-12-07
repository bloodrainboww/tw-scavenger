// =======================================================
//  TEMİZLEME PANELİ v2.1 - NİHAİ SÜRÜM
//  BloodRainBoww x ChatGPT
//  ✅ OKUMA + HESAPLAMA + INPUT DOLDURMA
//  ❌ TIKLAMA YOK
//  ❌ SALDIRI / SAVUNMA YOK
// =======================================================

(function () {

    if (window.SCAV_V21_LOADED) {
        UI.InfoMessage("Temizleme Paneli v2.1 zaten açık ✅");
        return;
    }
    window.SCAV_V21_LOADED = true;

    // ===============================
    //  BİRİM KAPASİTELERİ (GENEL)
    // ===============================
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

    // ENTER sırası
    const LEVELS = [4, 3, 2, 1];

    // Yüzdelikler
    const LEVEL_PCT = {
        4: 0.75,
        3: 0.50,
        2: 0.25,
        1: 0.10
    };

    let packs = {};
    let levelIndex = 0;

    // ===============================
    //  SADECE TEMİZLEME EKRANI
    // ===============================
    function isScavengeScreen() {
        return (
            location.href.includes("screen=place") &&
            location.href.includes("mode=scavenge")
        );
    }

    if (!isScavengeScreen()) {
        UI.ErrorMessage("Temizleme Paneli v2.1 yalnızca temizleme ekranında çalışır.");
        return;
    }

    // ===============================
    //  YARDIMCI FONKSİYONLAR
    // ===============================
    function $(q, root) {
        return (root || document).querySelector(q);
    }

    function $all(q, root) {
        return Array.from((root || document).querySelectorAll(q));
    }

    function el(id) {
        return document.getElementById(id);
    }

    function log(msg) {
        const l = el("scav_log");
        if (l) l.textContent = msg;
    }

    function parseTime(str) {
        if (!str) return 0;
        const p = str.split(":");
        const h = parseInt(p[0]) || 0;
        const m = parseInt(p[1]) || 0;
        return h * 3600 + m * 60;
    }

    // ===============================
    //  ✅ %100 GARANTİLİ BİRİM OKUMA
    // ===============================
    function readUnitCount(unit) {

        let a = document.querySelector(".units-entry-all[data-unit='" + unit + "']");
        if (a) return parseInt(a.textContent.replace(/\D/g, "")) || 0;

        let b = document.getElementById("units_entry_all_" + unit);
        if (b) return parseInt(b.textContent.replace(/\D/g, "")) || 0;

        let c = document.getElementById("unit_" + unit);
        if (c) return parseInt(c.textContent.replace(/\D/g, "")) || 0;

        let d = document.querySelector("td.unit-item-" + unit);
        if (d) return parseInt(d.textContent.replace(/\D/g, "")) || 0;

        return 0;
    }

    function readUnits(selected) {
        const result = {};
        let totalCap = 0;

        selected.forEach(u => {
            const cnt = readUnitCount(u);
            result[u] = cnt;
            totalCap += cnt * (UNIT_CAP[u] || 0);

            const ce = el("cnt_" + u);
            if (ce) ce.textContent = cnt;
        });

        return { units: result, totalCap: totalCap };
    }

    // ===============================
    //  PANEL OLUŞTURMA
    // ===============================
    function buildPanel() {

        if (el("scav_panel_v21")) return;

        const panel = document.createElement("div");
        panel.id = "scav_panel_v21";
        panel.style.cssText = `
            position:fixed;
            top:80px;
            right:25px;
            width:370px;
            background:#2f2f2f;
            color:#ffffff;
            z-index:99999;
            padding:12px;
            border-radius:12px;
            box-shadow:0 0 12px #000;
            font-size:12px;
        `;

        panel.innerHTML = `
            <div style="text-align:center;font-weight:bold;font-size:14px;margin-bottom:8px">
                Temizleme Paneli v2.1
            </div>

            <div style="text-align:center;margin-bottom:8px">
                Süre:
                <input id="scav_time" value="01:30"
                       style="width:80px;text-align:center">
            </div>

            <div id="unit_box"
                 style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px;"></div>

            <button id="scav_calc_btn"
                style="width:100%;padding:8px;border-radius:8px;border:none;
                       background:#d79b3b;color:#000;font-weight:bold;">
                Hesapla (ENTER)
            </button>

            <div id="scav_log"
                 style="margin-top:6px;font-size:11px;opacity:.9"></div>

            <div style="text-align:right;font-size:10px;opacity:.4;margin-top:6px">
                BloodRainBoww x ChatGPT
            </div>
        `;

        document.body.appendChild(panel);

        const ub = el("unit_box");

        game_data.units.forEach(u => {
            if (!UNIT_CAP[u]) return;

            const row = document.createElement("div");
            row.innerHTML = `
                <label style="display:flex;align-items:center;gap:6px">
                    <input type="checkbox" class="scav_unit" value="${u}" checked>
                    <img src="${image_base}unit/unit_${u}.png"
                         style="width:18px;height:18px">
                    <span id="cnt_${u}" style="flex:1;text-align:right">0</span>
                </label>
            `;
            ub.appendChild(row);
        });

        const first = $all(".scav_unit").map(e => e.value);
        readUnits(first);

        log("Askerler başarıyla okundu ✅");

        el("scav_calc_btn").onclick = calculate;
        document.addEventListener("keydown", onEnter);
    }

    // ===============================
    //  HESAPLAMA
    // ===============================
    function calculate() {

        const sec = parseTime(el("scav_time").value);
        if (!sec) {
            log("Süre geçersiz!");
            return;
        }

        const selected = $all(".scav_unit:checked").map(e => e.value);
        if (!selected.length) {
            log("Birim seçilmedi!");
            return;
        }

        const info = readUnits(selected);
        let units = info.units;
        const totalCap = info.totalCap;

        if (!totalCap) {
            log("Seçilen birliklerden köyde yok!");
            return;
        }

        packs = {};
        levelIndex = 0;

        LEVELS.forEach(lvl => {

            let need = totalCap * LEVEL_PCT[lvl];
            packs[lvl] = {};

            selected.forEach(u => {
                const cap = UNIT_CAP[u];
                const have = units[u] || 0;
                if (!cap || !have || need <= 0) return;

                const send = Math.min(have, Math.floor(need / cap));
                packs[lvl][u] = send;
                units[u] = have - send;
                need -= send * cap;
            });
        });

        log("Hesaplandı ✅ ENTER ile 4 → 1 doldur.");
    }

    // ===============================
    //  ✅ GERÇEK INPUT DOLDURMA
    // ===============================
    function fillLevel(lvl) {

        const data = packs[lvl];
        if (!data) return log("Seviye verisi yok!");

        const block = document.getElementById("scavenge-option-" + lvl);
        if (!block) return log("Seviye " + lvl + " bloğu bulunamadı!");

        Object.keys(data).forEach(u => {
            const input = block.querySelector(`input[name="${u}"]`);
            if (input) input.value = data[u];
        });

        log("Seviye " + lvl + " dolduruldu ✅");
    }

    // ===============================
    //  ✅ ENTER DÖNGÜSÜ
    // ===============================
    function onEnter(e) {
        if (e.key !== "Enter") return;

        if (levelIndex >= LEVELS.length) {
            log("Tüm seviyeler tamamlandı ✅");
            return;
        }

        fillLevel(LEVELS[levelIndex]);
        levelIndex++;
    }

    // ===============================
    //  BAŞLAT
    // ===============================
    buildPanel();

})();
