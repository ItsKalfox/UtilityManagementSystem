function hasPermission(p) {
  const admin = JSON.parse(localStorage.getItem("admin"));
  return admin?.permissions?.includes(p);
}
