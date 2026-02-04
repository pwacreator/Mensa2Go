import { loadMenu, openMenuDetailById, clearMenuDetail } from "./rezepte.js";

/* =====================
   Service Worker
===================== */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js");
  navigator.serviceWorker.addEventListener("controllerchange", () =>
    window.location.reload()
  );
}

/* =====================
   Loader
===================== */
const MIN_LOAD_TIME = 1050;
const loader = document.getElementById("loader");
const app = document.getElementById("app");

const startTime = performance.now();
let pageLoaded = false;

window.addEventListener("load", () => {
  pageLoaded = true;
  tryHideLoader();
});

function tryHideLoader() {
  if (!pageLoaded) return;
  const elapsed = performance.now() - startTime;
  setTimeout(() => {
    loader.classList.add("hide");
    setTimeout(() => loader.remove(), 300);
    app.hidden = false;
  }, Math.max(0, MIN_LOAD_TIME - elapsed));
}

/* =====================
   Tabs & Pages
===================== */
document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab");
  const pages = document.querySelectorAll(".page");
  const indicator = document.querySelector(".indicator");
  const homeContainer = document.getElementById("home-random");

  function updateIndicator(tab) {
    const rect = tab.getBoundingClientRect();
    const barRect = tab.parentElement.getBoundingClientRect();
    indicator.style.transform = `translateX(${
      rect.left - barRect.left + rect.width / 2 - 20
    }px)`;
  }

  function switchPage(pageId, tab) {
    pages.forEach(p => p.classList.toggle("active", p.id === pageId));
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    updateIndicator(tab);

    window.scrollTo(0, 0);

    // Home-Highlight entfernen
    if (pageId !== "home") {
      homeContainer.innerHTML = "";
    }

    // Rezept-Detail immer schließen, wenn wir nicht im Menü sind
    if (pageId !== "menu") {
      clearMenuDetail();
    }

    // Menü neu anzeigen
    if (pageId === "menu") {
      loadMenu();
    }

    // Home-Zufallsgericht
    if (pageId === "home") {
      renderHomeRandom();
    }
  }

  tabs.forEach(tab =>
    tab.addEventListener("click", () =>
      switchPage(tab.dataset.page, tab)
    )
  );

  updateIndicator(document.querySelector(".tab.active"));

  /* =====================
     Home – Zufallsgericht
  ===================== */
  async function renderHomeRandom() {
    if (homeContainer.innerHTML.trim() !== "") return;

    const res = await fetch("menu.json");
    const data = await res.json();
    const randomItem = data[Math.floor(Math.random() * data.length)];

    homeContainer.innerHTML = `
      <div class="menu-item featured" data-id="${randomItem.id}">
        <img src="${randomItem.image}">
        <h2>${randomItem.name}</h2>
        <p>${randomItem.description}</p>
      </div>
    `;

    homeContainer.querySelector(".menu-item").addEventListener("click", () => {
      const menuTab = document.querySelector('.tab[data-page="menu"]');
      menuTab.click();

      setTimeout(() => {
        openMenuDetailById(randomItem.id);
      }, 50);
    });
  }

  // Initial: Home laden
  renderHomeRandom();
});
