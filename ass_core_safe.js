// ==========================================
//  ASS CORE - SAFE VERSION (NO CLICK / NO SEND)
//  Based on ASS logic (TwCheese reference)
//  Only: READ → CALC → WRITE TO INPUT
// ==========================================

(function () {
    "use strict";

    if (!location.href.includes("screen=place") || !location.href.includes("mode=scavenge")) {
        alert("Bu script sadece temizleme ekranında çalışır.");
        return;
    }

    console.log("✅ ASS SAFE CORE LOADED");

    // ----------------------------------
    //  SCAVENGE SEVİYELERİ (YÜZDELER)
    // ----------------------------------
    const SCAVENGE_LEVELS = {
        scavenger_0: 0.75, // Büyük
        scavenger_1: 0.50, // Zeki
        scavenger_2: 0.25, // Mütevazı
        scavenger_3: 0.10  // Tembel
    };

    // ----------------------------------
    //  BİRİM KAPASİTELERİ (GENEL)
    // ----------------------------------
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

    // ----------------------------------
    //  KÖYDEKİ ASKERLERİ OKU
    // ----------------------------------
    function readVillageUnits() {
        const units = {};
        document.querySelectorAll(".units-entry-all").forEach(el => {
            const unit = el.dataset.unit;
            const count = parseInt(el.textContent.replace(/\D/g, ""));
            if (!isNaN(count)) units[unit] = count;
        });
        return units;
    }

    // ----------------------------------
    //  TOPLAM KAPASİTE HESABI
    // ----------------------------------
    function calculateTotalCapacity(units) {
        let total = 0;
        for (const unit in units) {
            if (UNIT_CAPACITY[unit]) {
                total += units[unit] * UNIT_CAPACITY[unit];
            }
        }
        return total;
    }

    // ----------------------------------
    //  KAPASİTEYİ SEVİYELERE BÖL
    // ----------------------------------
    function splitCapacityByLevel(totalCapacity) {
        const result = {};
        for (const level in SCAVENGE_LEVELS) {
            result[level] = Math.floor(totalCapacity * SCAVENGE_LEVELS[level]);
        }
        return result;
    }

    // ----------------------------------
    //  ASKER DAĞIT ve INPUT’A YAZ
    // ----------------------------------
    function distributeAndWrite() {
        const villageUnits = readVillageUnits();
        const totalCapacity = calculateTotalCapacity(villageUnits);
        const levelCaps = splitCapacityByLevel(totalCapacity);

        console.log("Toplam kapasite:", totalCapacity);
        console.log("Seviye kapasiteleri:", levelCaps);

        for (const level in SCAVENGE_LEVELS) {
            const block = document.getElementById(level);
            if (!block) continue;

            let remainingCap = levelCaps[level];

            for (const unit in villageUnits) {
                if (!UNIT_CAPACITY[unit]) continue;
                if (villageUnits[unit] <= 0) continue;

                const input = block.querySelector(`input[name='${unit}']`);
                if (!input) continue;

                const maxByCap = Math.floor(remainingCap / UNIT_CAPACITY[unit]);
                const sendCount = Math.min(maxByCap, villageUnits[unit]);

                if (sendCount > 0) {
                    input.value = sendCount;
                    remainingCap -= sendCount * UNIT_CAPACITY[unit];
                    villageUnits[unit] -= sendCount;
                }

                if (remainingCap <= 0) break;
            }
        }

        alert("✅ Askerler temizleme seviyelerine yazıldı.\n(Gönderme yok, sadece input dolduruldu)");
    }

    // ----------------------------------
    //  DIŞARI AÇILAN TEK FONKSİYON
    // ----------------------------------
    window.ASS_SAFE_FILL = distributeAndWrite;

    console.log("➡ Konsoldan şu komutla çalıştır:");
    console.log("ASS_SAFE_FILL();");

})();
