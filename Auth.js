// auth.js

export function getCurrentUser() {
  return localStorage.getItem("bobb_user");
}

export function login() {
  const username = document.getElementById("username").value.trim();
  if (!username) {
    alert("Enter a username.");
    return;
  }

  localStorage.setItem("bobb_user", username);

  // Initialize data for the new user if it doesn't exist
  if (!localStorage.getItem(`${username}_expenses`)) {
    localStorage.setItem(`${username}_expenses`, "[]");
  }
  if (!localStorage.getItem(`${username}_categories`)) {
    localStorage.setItem(`${username}_categories`, "[]");
  }
  if (!localStorage.getItem(`${username}_profile`)) {
    localStorage.setItem(`${username}_profile`, "{}");
  }

  window.location.href = "home.html";
}

export function logout() {
  localStorage.removeItem("bobb_user");
  window.location.href = "index.html";
}
