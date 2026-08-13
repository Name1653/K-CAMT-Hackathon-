function renderSelectedStoreNote() {
    const selectedStoreNote = document.getElementById("selectedStoreNote");
    const row = document.querySelector(".storeRow.selected");

    if (!selectedStoreNote || !row) return;

    const name = row.querySelector(".name").textContent.trim();

    selectedStoreNote.innerHTML =
        `${t("route_selected_label")}: <b>${name}</b><br>` +
        `${t("route_detour_label")}: ${row.dataset.detour} · ` +
        `${t("route_net_saved_label")}: ${row.dataset.netSaved}`;
}

document.addEventListener("DOMContentLoaded", () => {
    // 동선 맞춤 매장: 하나만 선택되도록 토글
    const storeRows = document.querySelectorAll(".storeRow");

    storeRows.forEach(row => {
        row.addEventListener("click", () => {
            storeRows.forEach(r => r.classList.remove("selected"));
            row.classList.add("selected");
            renderSelectedStoreNote();
        });
    });

    renderSelectedStoreNote();

    // 이동 수단: 하나만 선택되도록 토글
    const transportButtons = document.querySelectorAll(".transportButton");

    transportButtons.forEach(button => {
        button.addEventListener("click", () => {
            transportButtons.forEach(b => b.classList.remove("active"));
            button.classList.add("active");
        });
    });

    // 언어가 바뀌면 동적으로 렌더링한 안내 문구도 다시 그린다.
    onLanguageChange(renderSelectedStoreNote);
});
