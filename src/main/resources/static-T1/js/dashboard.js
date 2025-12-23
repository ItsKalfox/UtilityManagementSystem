const admin = JSON.parse(localStorage.getItem("admin"));
document.getElementById("profile").innerText =
  `${admin.fullName} (${admin.adminRole})`;

function showTab(id) {
  document.querySelectorAll(".tab").forEach(t => t.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}
