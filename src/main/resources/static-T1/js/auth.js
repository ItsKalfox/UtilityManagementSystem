async function adminLogin() {
  const res = await fetch("http://localhost:8080/api/auth/admin/login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      email: email.value,
      password: password.value
    })
  });

  const data = await res.json();
  localStorage.setItem("admin", JSON.stringify(data));
  location.href = "dashboard-admin.html";
}
