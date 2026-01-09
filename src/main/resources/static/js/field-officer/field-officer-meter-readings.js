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

            <!-- CUSTOMER DETAILS -->
            <div class="card-section">
                <h2 style="margin: 15px 0 25px 0px;">Customer Details</h2>

                <div class="form-grid">
                    <div class="form-group">
                        <label>Customer Type</label>
                        <select class="sort-select" style="display: flex; min-width: 100%;" >
                            <option>HOUSEHOLD</option>
                            <option>BUSINESS</option>
                            <option>GOVERNMENT ORGANIZATION</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Area Code</label>
                        <input type="text" id="areaCode">
                    </div>

                    <div class="form-group">
                        <label>Address Line 1</label>
                        <input type="text" id="address1">
                    </div>

                    <div class="form-group">
                        <label>Address Line 2</label>
                        <input type="text" id="address2">
                    </div>

                    <div class="form-group">
                        <label>City</label>
                        <input type="text" id="city">
                    </div>

                    <div class="form-group">
                        <label>Postal Code</label>
                        <input type="text" id="postalCode">
                    </div>

<!--                    <div class="form-group">-->
<!--                        <label>Status</label>-->
<!--                        <span class="status-pill active">ACTIVE</span>-->
<!--                    </div>-->pppppp

                    <div class="form-group">
                        <label>Created At</label>
                        <input type="text" readonly value="${new Date().toISOString().split("T")[0]}">
                    </div>

                    <div class="form-group">
                        <label>Updated At</label>
                        <input type="text" readonly value="${new Date().toISOString().split("T")[0]}">
                    </div>
                </div>
            </div>
            <!-- METER READING -->
                        <div class="card-section">
                            <h4>Meter Reading</h4>

                            <div class="form-grid">
                                <div class="form-group">
                                    <label>Reading Value</label>
                                    <input type="number" id="readingValue" placeholder="Enter meter reading">
                                </div>
                            </div>
                        </div>
            <!-- CONNECTION DETAILS (READ ONLY) -->
            <div class="card-section">
                <h4>Connection Details</h4>

                <div class="form-grid">
                    <div class="form-group">
                        <label>Tariff Name</label>
                        <input type="text" id="tariffName">
                    </div>

                    <div class="form-group">
                        <label>Tariff Description</label>
                        <input type="text" id="tariffDesc">
                    </div>

                    <div class="form-group">
                        <label>Utility Type</label>
                        <input type="text" id="utilityType">
                    </div>

                    <div class="form-group">
                        <label>Meter Serial No</label>
                        <input type="text" id="meterSerial" readonly>
                    </div>

                    <div class="form-group">
                        <label>Install Date</label>
                        <input type="text" id="installDate" readonly>
                    </div>

                    <div class="form-group">
                        <label>Connection ID</label>
                        <input type="text" id="connectionId" readonly>
                    </div>
                </div>
            </div>
        </div>

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
