// =====================================================
//  SCAVENGER MODULE - FINAL (NO RESERVE, CLEAN VERSION)
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
   PANEL UI - DARK GREY + WIDE (NO RESERVE)
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
        <b style="font-size:15px;">Temizleme Modülü (Rezervsiz)</b><br><br>

        <!-- SÜRE -->
        <div style="margin-bottom:14px;">
            <div>Hedef Süre (HH:MM)</div>
            <input id="scav_time" type="text" value="01:30"
                style="width:90px;background:#222;border:1px solid #777;color:#eee;padding:4px;">
        </div>

        <div style="font-weight:bold;margin-bottom:10px;">Birim Seçimi</div>

        ${
