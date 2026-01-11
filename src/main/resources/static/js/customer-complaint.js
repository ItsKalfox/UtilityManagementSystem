document.addEventListener("DOMContentLoaded", function () {

    const complaintForm = document.getElementById("complaintForm");
    const description = document.getElementById("description");
    const complaintType = document.getElementById("complaintType");
    const messageBox = document.getElementById("complaintMessage");

    if (!complaintForm) return;

    complaintForm.addEventListener("submit", function (e) {
        e.preventDefault();

        // Reset message
        messageBox.innerText = "";
        messageBox.className = "complaint-message";

        const text = description.value.trim();

        // ❌ EMPTY → FAIL
        if (text === "") {
            messageBox.innerText = "Failed to submit complaint.";
            messageBox.classList.add("error");
            return;
        }

        // ✅ VALID → SUBMIT
        fetch("http://localhost:8080/api/complaints/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                customerId: localStorage.getItem("customerId"),
                complaintType: complaintType.value,
                description: text
            })
        })
            .then(res => {
                if (!res.ok) throw new Error();
                return res.text();
            })
            .then(() => {
                messageBox.innerText =
                    "Complaint submitted successfully. Our support team will review it.";
                messageBox.classList.add("success");
                complaintForm.reset();
            })
            .catch(() => {
                messageBox.innerText = "Failed to submit complaint.";
                messageBox.classList.add("error");
            });
    });
});
