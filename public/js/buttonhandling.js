"use strict";

window.addEventListener("load", initializeThemeMode);

const themeToggleButton = document.getElementById("toggle-theme");
themeToggleButton.addEventListener("click", toggleThemeMode);

function initializeThemeMode() {
  // Setting 'DARK' as the default theme if themeMode is Null...
  let themeMode = localStorage.getItem("themeMode") || "DARK";
  localStorage.setItem("themeMode", themeMode);

  updatePageThemeMode(themeMode);
}

function toggleThemeMode() {
  let themeMode = localStorage.getItem("themeMode");
  let newThemeMode = themeMode === "DARK" ? "LIGHT" : "DARK";

  // Update the UI of the current page
  updatePageThemeMode(newThemeMode);
}

function updatePageThemeMode(themeMode) {
  localStorage.setItem("themeMode", themeMode);

  const bodyElement = document.querySelector("body");
  themeToggleButton.textContent = themeMode;

  if (themeMode === "LIGHT") {
    bodyElement.classList.add("light-mode");
    bodyElement.classList.remove("dark-mode");
  } else {
    bodyElement.classList.add("dark-mode");
    bodyElement.classList.remove("light-mode");
  }
}
