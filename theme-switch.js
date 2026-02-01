const toggle = document.getElementById("themeToggle");
const root = document.documentElement;

// 1. Initial Theme setzen
const storedTheme = localStorage.getItem("theme");

if (storedTheme) {
  root.setAttribute("data-theme", storedTheme);
  toggle.checked = storedTheme === "dark";
} else {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  root.setAttribute("data-theme", prefersDark ? "dark" : "light");
  toggle.checked = prefersDark;
}

// 2. Toggle Listener
toggle.addEventListener("change", () => {
  const theme = toggle.checked ? "dark" : "light";
  root.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
});
