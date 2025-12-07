// ================================
//  Temizleme Paneli v2.1
//  BloodRainBoww x ChatGPT
//  - Sadece temizleme ekranında çalışır
//  - Dış siteye istek yok (sadece bu dosya yüklenir)
//  - Tıklama yok, saldırı / savunma yok
//  - Birim sayısını otomatik okur, sadece kutulara sayı yazar
// ================================

(function () {
    if (window.SCAV_V21_MODULE_LOADED) return;
    window.SCAV_V21_MODULE_LOADED = true;

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

    const LEVELS = [4, 3, 2, 1];
    const LEVEL_PCTS = [0.75, 0.50, 0.25, 0.10];

    let packs = {};
    let levelIndex = 0;

    function onScavengeScreen() {
        const url = location.href;
        return url.includes("screen=place") && url.includes("mode=scavenge");
    }

    if (!onScavengeScreen()) {
        UI.ErrorMessage("Temizleme Paneli v2.1 sadece temizleme ekranında çalışır.");
        return;
    }

    function $(sel, root) {
        return (root || document).querySelector(sel);
    }
    function $all(sel, root) {
        return Array.from((root || document).querySelectorAll(sel));
    }
    function el(id) {
        return document.getElementById(id);
    }

    function parseTime(str) {
        if (!str) return 0;
        const parts = str.split(":");
        const h = parseInt(parts[0]) || 0;
        const m = parseInt(parts[1]) || 0;
        return h * 3600 + m * 60;
    }

    function log(msg) {
        const box = el("scav_log");
        if (box) box.textContent = msg;
    }

    // Köydeki birlik sayısını oku
    function readUnitCount(unit) {
        const byId = el("units_entry_all_" + unit);
        if (byId) {
            return parseInt(byId.textContent.replace(/\D/g, "")) || 0;
        }
        const span = $(`.units-entry-all[data-unit="${unit}"]`);
        if (span) {
            return parseInt(span.textContent.replace(/\D/g, "")) || 0;
        }
        return 0;
    }

    function readUnits(selectedUnits) {
        const result = {};
        let totalCap = 0;
        selectedUnits.forEach(u => {
            const count = readUnitCount(u);
            result[u] = count;
            totalCap += count * (UNIT_CAP[u] || 0);
            const cEl = el("cnt_" + u);
            if (cEl) cEl.textContent = count;
        });
        return { units: result, totalCap };
    }

    function buildPanel() {
        if (el("scav_panel_v21")) return;

        const panel = document.createElement("div");
        panel.id = "scav_panel_v21";
        panel.style.cssText = [
            "position:fixed",
            "right:25px",
            "top:80px",
            "width:340px",
            "background:#2f2f2f",
            "color:#fff",
            "z-index:99999",
            "padding:10px",
            "border-radius:10px",
            "box-shadow:0 0 10px #000",
            "font-size:12px"
        ].join(";");

        panel.innerHTML = `
            <div style="text-align:center;font-weight:bold;font-size:14px;margin-bottom:6px">
                Temizleme Paneli v2.1
            </div>

            <div style="text-align:center;margin-bottom:6px">
                Süre:
                <input id="scav_time" type="text" value="01:30"
                       style="width:70px;text-align:center">
            </div>

            <div id="unit_box"
                 style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:6px;"></div>

            <button id="scav_calc_btn"
                style="width:100%;padding:6px;border-radius:6px;border:none;
                       background:#d79b3b;color:#000;font-weight:bold;margin-top:2px">
                Hesapla (ENTER ile doldur)
            </button>

            <div id="scav_log"
                 style="margin-top:6px;font-size:11px;opacity:.9"></div>

            <div style="text-align:right;font-size:10px;opacity:.4;margin-top:4px">
                BloodRainBoww x ChatGPT
            </div>
        `;

        document.body.appendChild(panel);

        const unitBox = el("unit_box");
        game_data.units.forEach(u => {
            if (!UNIT_CAP[u]) return; // sadece seçtiğimiz birimler
            const row = document.createElement("div");
            row.innerHTML = `
                <label style="display:flex;align-items:center;gap:4px">
                    <input type="checkbox" class="scav_unit" value="${u}" checked>
                    <img src="${image_base}unit/unit_${u}.png"
                         style="width:18px;height:18px;background:#555;border-radius:3px;">
                    <span style="flex:1;text-align:right" id="cnt_${u}">0</span>
                </label>
            `;
            unitBox.appendChild(row);
        });

        const initialUnits = $all(".scav_unit").map(e => e.value);
        readUnits(initialUnits);
        log("Askerler otomatik okundu ✅");

        el("scav_calc_btn").onclick = calculate;
        document.addEventListener("keydown", onEnterKey);
    }

    function calculate() {
        const timeStr = el("scav_time").value || "01:30";
        const seconds = parseTime(timeStr);
        if (!seconds) {
            log("Süre okunamadı.");
            return;
        }

        const selectedUnits = $all(".scav_unit:checked").map(e => e.value);
        if (!selectedUnits.length) {
            log("Hiç birlik seçmedin.");
            return;
        }

        const info = readUnits(selectedUnits);
        let units = info.units;
        const totalCap = info.totalCap;

        if (!totalCap) {
            log("Seçili birliklerden köyde yok.");
            return;
        }

        packs = {};
        levelIndex = 0;

        LEVELS.forEach((lvl, i) => {
            let needCap = totalCap * LEVEL_PCTS[i];
            packs[lvl] = {};

            selectedUnits.forEach(u => {
                const cap = UNIT_CAP[u];
                if (!cap) return;
                const have = units[u] || 0;
                if (!have || needCap <= 0) return;

                const can = Math.min(have, Math.floor(needCap / cap));
                packs[lvl][u] = can;
                units[u] = have - can;
                needCap -= can * cap;
            });
        });

        log("Dağıtım hesaplandı. ENTER ile 4 → 1 seviyelerini doldur.");
    }

    function fillLevel(lvl) {
        const data = packs[lvl];
        if (!data) {
            log("Bu seviye için hesap yok.");
            return;
        }

        const blocks = $all(".scavenge-option");
        const block = blocks[lvl - 1]; // seviye 1–4 sırayla
        if (!block) {
            log("Seviye bloğu bulunamadı.");
            return;
        }

        Object.keys(data).forEach(u => {
            const val = data[u];
            const input = block.querySelector(`input[name="${u}"]`);
            if (input) input.value = val;
        });

        log("Seviye " + lvl + " dolduruldu.");
    }

    function onEnterKey(e) {
        if (e.key !== "Enter") return;
        if (levelIndex >= LEVELS.length) {
            log("Tüm seviyeler dolduruldu.");
            return;
        }
        const lvl = LEVELS[levelIndex];
        fillLevel(lvl);
        levelIndex++;
    }

    buildPanel();
})();
