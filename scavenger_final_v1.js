// ================================
//  KLANLAR TEMİZLEME YARDIMCISI
//  V3.2 - ENTER DÖNGÜSÜ + FAVORİ SÜRELER
//        + BİRİM SEÇİMİ + BAYRAK BİLGİSİ
//        + KÖYDEKİ ASKERLERİ OTOMATİK ÇEK
//  (github üzerinden yüklenir, tıklama yok, saldırı yok)
// ================================

(function () {

    // Sadece temizleme ekranında çalışsın
    if (!location.href.includes("screen=place") || !location.href.includes("mode=scavenge")) {
        alert("Önce temizleme (çapulcu) ekranına gir.");
        return;
    }

    // Eski panel varsa kapat
    var old = document.getElementById("tw_final_panel");
    if (old) old.remove();

    // Seviye döngüsü: 3 = Lvl4, 2 = Lvl3, 1 = Lvl2, 0 = Lvl1
    if (typeof window.TW_SCAV_CURRENT_LEVEL === "undefined") {
        window.TW_SCAV_CURRENT_LEVEL = 3; // ilk: Lvl4 (%75)
    }

    // -------- BAYRAK BİLGİSİ HESAPLAMA --------

    var haulFactor =
        (window.game_data &&
            window.game_data.village &&
            window.game_data.village.unit_carry_factor) || 1;

    var bonusPercent = Math.round((haulFactor - 1) * 100); // örn. 1.08 -> 8%
    var flagInfoText;

    if (bonusPercent <= 0) {
        flagInfoText = "Taşıma bayrağı yok veya etkisiz.";
    } else {
        // Senin verdiğin skala: %2–%10 → seviye 1–9
        var levelMap = { 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 7, 9: 8, 10: 9 };
        var lvl = levelMap[bonusPercent] || "?";
        flagInfoText =
            "Taşıma bayrağı: " +
            (lvl === "?" ? "bilinmeyen seviye" : ("Seviye " + lvl)) +
            " (+" +
            bonusPercent +
            "% kapasite)";
    }

    // -------- PANEL OLUŞTURMA --------

    var panel = document.createElement("div");
    panel.id = "tw_final_panel";
    panel.style.cssText = [
        "position:fixed",
        "top:80px",
        "right:40px",
        "background:#3a3a3a",
        "color:#eee",
        "padding:14px",
        "border-radius:14px",
        "border:1px solid #666",
        "width:420px",
        "z-index:999999",
        "font-size:13px",
        "box-shadow:0 0 12px rgba(0,0,0,.7)"
    ].join(";") + ";";

    function unitRow(u, label) {
        return (
            '<div style="display:flex;align-items:center;gap:6px;margin:4px 0;">' +
            '<input type="checkbox" class="tw_enable" data-unit="' + u + '" checked>' +
            '<img src="/graphic/unit/unit_' + u + '.png" width="18" height="18">' +
            '<span style="flex:1;">' + label + '</span>' +
            '<input class="tw_count" data-unit="' + u + '" type="number" value="0"' +
            '       style="width:60px;background:#222;color:#eee;border:1px solid #555;text-align:center;">' +
            '</div>'
        );
    }

    panel.innerHTML =
        '<div style="font-size:15px;text-align:center;font-weight:bold;margin-bottom:4px;">' +
        '    🛡️ Temizleme Dağıtım Paneli (ENTER Paşa Modu)' +
        ' </div>' +

        '<div id="tw_flag" style="text-align:center;font-size:11px;margin-bottom:4px;color:#ccc;">' +
        flagInfoText +
        '</div>' +

        '<div style="text-align:center;margin-bottom:6px;">' +
        '    <button type="button" id="tw_fill_from_village" ' +
        '            style="padding:3px 6px;font-size:11px;background:#555;border:1px solid #333;border-radius:6px;color:#eee;">' +
        '        Köydeki askerleri çek' +
        '    </button>' +
        '</div>' +

        '<div style="text-align:center;margin-bottom:8px;">' +
        '    Hedef Süre (HH:MM)<br>' +
        '    <input id="tw_time" value="01:30"' +
        '           style="width:90px;background:#222;color:#eee;border:1px solid #555;text-align:center;">' +
        '</div>' +

        '<div style="text-align:center;margin-bottom:8px;font-size:12px;">' +
        '    Kısayollar: ' +
        '    <button type="button" class="tw_preset" data-time="01:05">01:05</button>' +
        '    <button type="button" class="tw_preset" data-time="01:30">01:30</button>' +
        '    <button type="button" class="tw_preset" data-time="02:00">02:00</button>' +
        '    <button type="button" class="tw_preset" data-time="04:00">04:00</button>' +
        '</div>' +

        '<div id="tw_level_info" style="text-align:center;margin-bottom:8px;font-size:12px;">' +
        '    Şu an doldurulacak seviye: <b>Lvl4 (%75)</b><br>' +
        '    (Enter veya butona basınca bu seviyeyi hesaplayıp kutuya yazar)' +
        '</div>' +

        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
        unitRow("spear", "Mızrak") +
        unitRow("sword", "Kılıç") +
        unitRow("axe", "Balta") +
        unitRow("archer", "Okçu") +
        unitRow("light", "Hafif Atlı") +
        unitRow("heavy", "Ağır Atlı") +
        unitRow("marcher", "Atlı Okçu") +
        unitRow("knight", "Şövalye") +
        '</div>' +

        '<button id="tw_calc" style="margin-top:10px;width:100%;padding:8px;' +
        '        background:#c89b54;border:1px solid #705020;border-radius:8px;font-weight:bold;">' +
        '    🧮 Enter / Tık ile Hesapla ve Bu Seviyeye Yaz' +
        '</button>' +

        '<div id="tw_result" style="margin-top:8px;font-size:12px;line-height:1.4;"></div>' +

        '<button id="tw_close" style="margin-top:6px;width:100%;padding:6px;' +
        '        background:#555;border:1px solid #333;border-radius:8px;color:#eee;">' +
        '    Kapat' +
        '</button>';

    document.body.appendChild(panel);

    document.getElementById("tw_close").onclick = function () {
        panel.remove();
    };

    function updateLevelInfo() {
        var info = document.getElementById("tw_level_info");
        var idx = window.TW_SCAV_CURRENT_LEVEL;
        var name = ["Lvl1 (%10)", "Lvl2 (%25)", "Lvl3 (%50)", "Lvl4 (%75)"][idx];
        if (info) {
            info.innerHTML =
                "Şu an doldurulacak seviye: <b>" + name + "</b><br>" +
                "(Enter veya butona basınca bu seviyeyi hesaplayıp kutuya yazar)";
        }
    }
    updateLevelInfo();

    // -------- FAVORİ SÜRE BUTONLARI --------

    document.querySelectorAll(".tw_preset").forEach(function (btn) {
        btn.onclick = function () {
            var t = this.dataset.time;
            var input = document.getElementById("tw_time");
            if (input) input.value = t;
        };
    });

    // -------- KÖYDEKİ ASKERLERİ OTOMATİK ÇEK BUTONU --------

    document.getElementById("tw_fill_from_village").onclick = function () {
        try {
            // Klanlar temizleme ekranındaki "tüm birlik" sayıları:
            // <span class="units-entry-all" data-unit="spear">(650)</span> gibi.
            var map = {};
            document.querySelectorAll(".units-entry-all").forEach(function (el) {
                var u = el.getAttribute("data-unit");
                if (!u) return;
                var txt = el.textContent || "";
                var m = txt.match(/(\d+)/);
                var val = m ? parseInt(m[1], 10) : 0;
                map[u] = val;
            });

            // Paneldeki kutulara yaz
            document.querySelectorAll(".tw_count").forEach(function (inp) {
                var u = inp.dataset.unit;
                if (map[u] != null) {
                    inp.value = map[u];
                }
            });

            alert("Köydeki mevcut birlikler panele aktarıldı.");
        } catch (e) {
            console.log("Köy birlikleri okunurken hata:", e);
            alert("Köydeki birlikler okunamadı. Sayfada .units-entry-all yapısı değişmiş olabilir.");
        }
    };

    // -------- SABİTLER / FORMÜLLER --------

    // Seviye yüzdeleri (idx: 0=L1 .. 3=L4)
    var PERCENTS = [0.10, 0.25, 0.50, 0.75];

    // Taşıma kapasiteleri
    var CARRY = {
        spear: 25,
        sword: 15,
        axe: 10,
        archer: 18,
        light: 80,
        heavy: 50,
        marcher: 50,
        knight: 100
    };

    function durationFromK(K) {
        var inner = K * K * 100;
        var powered = Math.pow(inner, 0.45);
        return (powered + 1800) * 0.7722074897; // saniye
    }

    function formatTime(sec) {
        sec = Math.round(sec);
        var h = Math.floor(sec / 3600);
        var m = Math.floor((sec % 3600) / 60);
        return h.toString().padStart(2, "0") + ":" + m.toString().padStart(2, "0");
    }

    // -------- HESAP MOTORU --------

    function runScavCalc() {

        // 1) Hedef süreyi oku
        var timeStr = (document.getElementById("tw_time").value || "").trim();
        var m = timeStr.match(/^(\d+):(\d{1,2})$/);
        if (!m) {
            alert("Süreyi HH:MM şeklinde gir ya da butonlardan seç. Örn: 01:30");
            return;
        }
        var HH = parseInt(m[1], 10);
        var MM = parseInt(m[2], 10);
        if (isNaN(HH) || isNaN(MM)) {
            alert("Geçersiz süre girdin.");
            return;
        }
        var targetSeconds = HH * 3600 + MM * 60;

        // 2) Panelden birimlerin aktifliği + asker sayısı ve toplam kapasiteyi topla
        var enabled = {};
        document.querySelectorAll(".tw_enable").forEach(function (cb) {
            enabled[cb.dataset.unit] = cb.checked;
        });

        var units = {};
        var totalCarry = 0;

        document.querySelectorAll(".tw_count").forEach(function (inp) {
            var u = inp.dataset.unit;
            var v = parseInt(inp.value) || 0;

            if (!enabled[u]) {
                v = 0; // seçili değilse bu birim oyuna katılmıyor
            }

            units[u] = v;
            if (CARRY[u] && v > 0) {
                totalCarry += v * CARRY[u] * haulFactor;
            }
        });

        if (totalCarry <= 0) {
            alert("Önce panelde en az bir aktif birlik gir (örn. 650 mızrak).");
            return;
        }

        // 3) Eşit süre mantığı
        var invSum = 0;
        for (var i = 0; i < PERCENTS.length; i++) {
            invSum += 1 / PERCENTS[i];
        }

        var K_max = totalCarry / invSum;
        if (K_max <= 0) {
            alert("Kapasite hesaplanamadı.");
            return;
        }

        var t_max = durationFromK(K_max);

        var low = 0;
        var high = K_max;

        for (var it = 0; it < 30; it++) {
            var mid = (low + high) / 2;
            var cur = durationFromK(mid);
            if (cur < targetSeconds) {
                low = mid;
            } else {
                high = mid;
            }
        }

        var K = high;
        if (targetSeconds > t_max) {
            K = K_max;
        }

        var finalDuration = durationFromK(K);

        // 4) Her seviye için hedef kapasite
        var capTargets = [];
        for (var j = 0; j < PERCENTS.length; j++) {
            capTargets[j] = K / PERCENTS[j];
        }

        // 5) Askerleri dört seviyeye paylaştır
        var remainingUnits = Object.assign({}, units);
        var result = [{}, {}, {}, {}];

        var baseOrder = ["light", "marcher", "axe", "spear", "sword", "archer", "heavy", "knight"];
        var order = baseOrder.filter(function (u) { return enabled[u]; });

        for (var level = 3; level >= 0; level--) {
            var needCap = capTargets[level];

            for (var oi = 0; oi < order.length; oi++) {
                var u = order[oi];
                var have = remainingUnits[u] || 0;
                var capPerUnit = (CARRY[u] || 0) * haulFactor;
                if (have <= 0 || capPerUnit <= 0 || needCap <= 0) continue;

                var maxByCap = Math.floor(needCap / capPerUnit);
                var take = Math.min(have, maxByCap);

                if (take > 0) {
                    if (!result[level][u]) result[level][u] = 0;
                    result[level][u] += take;
                    remainingUnits[u] -= take;
                    needCap -= take * capPerUnit;
                }
            }
        }

        // 6) Panelde hepsini göster, ama sadece seçilen seviye input'a yaz
        var resDiv = document.getElementById("tw_result");

        function fmtLevel(idx, name) {
            var r = result[idx];
            var parts = [];
            Object.keys(r).forEach(function (u) {
                parts.push(r[u] + " " + u);
            });
            if (!parts.length) return name + ": (0)";
            return name + ": " + parts.join(", ");
        }

        resDiv.innerHTML =
            "<b>Hedef süre: </b>" + formatTime(targetSeconds) + "<br>" +
            "<b>Gerçek hesaplanan süre (yaklaşık): </b>" + formatTime(finalDuration) + "<br><br>" +
            "<b>Önerilen Dağılım (tüm seviyeler):</b><br>" +
            fmtLevel(3, "Lvl4 (%75)") + "<br>" +
            fmtLevel(2, "Lvl3 (%50)") + "<br>" +
            fmtLevel(1, "Lvl2 (%25)") + "<br>" +
            fmtLevel(0, "Lvl1 (%10)") + "<br>" +
            "<span style='font-size:11px;color:#ccc;'>Not: Oyundaki kutulara şu an seçili seviye için asker yazmayı deniyorum. Gerekirse buradan elle de girebilirsin.</span>";

        // 7) ŞU ANKİ LEVEL İÇİN OYUN INPUT'LARINI DOLDUR
        var lvlIdx = window.TW_SCAV_CURRENT_LEVEL; // 3..0
        var lvlName = ["Lvl1 (%10)", "Lvl2 (%25)", "Lvl3 (%50)", "Lvl4 (%75)"][lvlIdx];
        var chosen = result[lvlIdx];

        try {
            Object.keys(chosen).forEach(function (u) {
                var count = chosen[u];
                var inp = document.querySelector("input[name='" + u + "']");
                if (inp) {
                    inp.value = count;
                    inp.dispatchEvent(new Event("input", { bubbles: true }));
                    inp.dispatchEvent(new Event("change", { bubbles: true }));
                }
            });
        } catch (err) {
            console.log("Input doldurma denemesi sırasında hata:", err);
        }

        alert(
            "Seviye: " + lvlName + " için hesaplama tamamlandı.\n" +
            "Gerçek süre (yaklaşık): " + formatTime(finalDuration) +
            "\nGönder tuşuna bastıktan sonra tekrar Enter / butona basarak sıradaki seviyeyi doldurabilirsin."
        );

        // 8) Seviye döngüsünü ilerlet (4 -> 3 -> 2 -> 1 -> 4 ...)
        window.TW_SCAV_CURRENT_LEVEL--;
        if (window.TW_SCAV_CURRENT_LEVEL < 0) {
            window.TW_SCAV_CURRENT_LEVEL = 3;
        }
        updateLevelInfo();
    }

    // Buton tıklaması
    document.getElementById("tw_calc").onclick = runScavCalc;

    // -------- ENTER TUŞU KISAYOLU --------

    if (!window.TW_SCAV_ENTER_BOUND) {
        window.TW_SCAV_ENTER_BOUND = true;

        document.addEventListener(
            "keydown",
            function (ev) {
                if (!document.getElementById("tw_final_panel")) return;
                if (ev.key !== "Enter") return;
                ev.preventDefault();
                runScavCalc();
            },
            true
        );
    }
})();
