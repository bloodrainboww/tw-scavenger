// ==========================================
//  ASS CORE - SAFE VERSION v2.1 FIXED
//  REAL GAME INPUT COMPATIBLE
//  ONLY: READ → CALC → WRITE
//  NO CLICK / NO SEND
// ==========================================

(function () {
    "use strict";

    if (!location.href.includes("screen=place") || !location.href.includes("mode=scavenge")) {
        alert("Bu script sadece temizleme ekranında çalışır.");
        return;
    }

    console.clear();
    console.log("✅ ASS SAFE CORE v2.1 FIXED YÜKLENDİ");

    // =========================
    //  SEVİYE ORANLARI
    // =========================
    const SCAVENGE_LEVELS = {
        scavenger_0: 0.75, // Büyük
        scavenger_1: 0.50, // Zeki
        scavenger_2: 0.25, // Mütevazı
        scavenger_3: 0.10  // Tembel
    };

    // =========================
    //  BİRİM KAPASİTELERİ
    // =========================
    const UNIT_CAPACITY = {
        spear: 25,
        sword: 15,
        axe: 10,
        archer: 18,
        light: 80,
        marcher: 50,
        heavy: 50,
        knight: 100
    };

    // =========================
    //  KÖYDEKİ ASKER OKUMA
    // =========================
    function readVillageUnits() {
        const units = {};
        document.querySelectorAll(".units-entry-all").forEach(el => {
            const unit = el.dataset.unit;
            const count = parseInt(el.textContent.replace(/\D/g, ""));
            if (!isNaN(count)) units[unit] = count;
        });

        console.log("📦 Köyde okunan askerler:", units);
        return units;
    }

    // =========================
    //  TOPLAM KAPASİTE
    // =========================
    function calculateTotalCapacity(units) {
        let total = 0;
        for (const u in units) {
            if (UNIT_CAPACITY[u]) {
                total += units[u] * UNIT_CAPACITY[u];
            }
        }
        console.log("🧮 Toplam kapasite:", total);
        return total;
    }

    // =========================
    //  SEVİYELERE BÖL
    // =========================
    function splitCapacity(total) {
        const caps = {};
        for (const lvl in SCAVENGE_LEVELS) {
            caps[lvl] = Math.floor(total * SCAVENGE_LEVELS[lvl]);
        }
        console.log("📊 Seviye kapasiteleri:", caps);
        return caps;
    }

    // =========================
    //  GERÇEK INPUT BULUCU
    // =========================
    function findRealInput(block, unit) {
        return (
            block.querySelector(`input[name='${unit}']`) ||
            block.querySelector(`.unitsInput[name='${unit}']`)
        );
    }

    // =========================
    //  DAĞIT & YAZ
    // =========================
    function distributeAndWrite() {
        const villageUnits = readVillageUnits();
        const totalCap = calculateTotalCapacity(villageUnits);
        const levelCaps = splitCapacity(totalCap);

        let wroteSomething = false;

        for (const level in SCAVENGE_LEVELS) {
            const block = document.getElementById(level);
            if (!block) {
                console.warn("❌ Seviye bloğu bulunamadı:", level);
                continue;
            }

            let remainingCap = levelCaps[level];

            for (const unit in villageUnits) {
                if (!UNIT_CAPACITY[unit]) continue;
                if (villageUnits[unit] <= 0) continue;

                const input = findRealInput(block, unit);
                if (!input) continue;

                const maxByCap = Math.floor(remainingCap / UNIT_CAPACITY[unit]);
                const sendCount = Math.min(maxByCap, villageUnits[unit]);

                if (sendCount > 0) {
                    input.value = sendCount;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    remainingCap -= sendCount * UNIT_CAPACITY[unit];
                    villageUnits[unit] -= sendCount;
                    wroteSomething = true;

                    console.log(`✍️ ${level} → ${unit}: ${sendCount} yazıldı`);
                }

                if (remainingCap <= 0) break;
            }
        }

        if (wroteSomething) {
            alert("✅ Askerler gerçek oyun input’larına yazıldı.\n(Gönderme YOK)");
        } else {
            alert("❌ Hiçbir input bulunamadı.\nOyunun HTML yapısı farklı olabilir.");
        }
    }

    // =========================
    //  DIŞARI AÇ
    // =========================
    window.ASS_SAFE_FILL = distributeAndWrite;
    console.log("➡ Konsola şunu yaz:");
    console.log("ASS_SAFE_FILL();");

})();
