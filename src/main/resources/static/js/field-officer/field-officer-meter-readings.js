/* =========================
   OPEN MODAL
========================= */
function openMeterReadingModal(data = {}) {
    const modal = document.getElementById("recordModal");
    const overlay = document.getElementById("modalOverlay");

    modal.innerHTML = `
        <div class="modal-header">
            <h3>Meter Reading Application</h3>
            <button class="close-btn" onclick="closeModal()">✕</button>
        </div>

        <div class="modal-body scrollable-modal">

        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn btn-save" onclick="saveMeterReading()">Save</button>
        </div>
    `;

    modal.classList.add("active");
    overlay.classList.add("active");

    loadConnectionData();
}

/* =========================
   SAVE METER READING
========================= */

/* =========================
   CLOSE MODAL
========================= */
function closeModal() {
    document.getElementById("recordModal").classList.remove("active");
    document.getElementById("modalOverlay").classList.remove("active");
}
