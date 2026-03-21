import { loadMenu, openMenuDetailById, clearMenuDetail } from "./rezepte.js";

/* =====================
   Service Worker
===================== */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("./service-worker.js")
    .then(() => console.log("Service Worker registered"))
    .catch((err) => console.error("SW registration failed:", err));

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    window.location.reload();
  });
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
  setTimeout(
    () => {
      loader.classList.add("hide");
      setTimeout(() => loader.remove(), 300);
      app.hidden = false;
    },
    Math.max(0, MIN_LOAD_TIME - elapsed),
  );
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
    pages.forEach((p) => p.classList.toggle("active", p.id === pageId));
    tabs.forEach((t) => t.classList.remove("active"));
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

  tabs.forEach((tab) =>
    tab.addEventListener("click", () => switchPage(tab.dataset.page, tab)),
  );

  updateIndicator(document.querySelector(".tab.active"));

  /* =====================
     Home – Zufallsgericht
  ===================== */
  async function renderHomeRandom() {
    if (homeContainer.innerHTML.trim() !== "") return;

    const today = new Date().toISOString().split("T")[0];

    const savedDate = localStorage.getItem("dailyMenuDate");
    const savedData = JSON.parse(localStorage.getItem("dailyMenuItems"));

    const res = await fetch("menu.json");
    const data = await res.json();

    let items = [];

    if (savedDate === today && savedData) {
      items = savedData.map((id) => data.find((item) => item.id == id));
    } else {
      // 1. komplett zufällig
      const randomItem = data[Math.floor(Math.random() * data.length)];

      // 2. Fleisch (ohne randomItem)
      const fleischItems = data.filter(
        (item) =>
          item.id !== randomItem.id && item.keywords?.includes("fleisch"),
      );
      const fleischItem =
        fleischItems[Math.floor(Math.random() * fleischItems.length)];

      // 3. Vegetarisch oder Vegan (ohne random + fleisch)
      const vegItems = data.filter(
        (item) =>
          item.id !== randomItem.id &&
          item.id !== fleischItem.id &&
          (item.keywords?.includes("vegetarisch") ||
            item.keywords?.includes("vegan")),
      );
      const vegItem = vegItems[Math.floor(Math.random() * vegItems.length)];

      items = [
        { ...randomItem, type: "random" },
        { ...fleischItem, type: "fleisch" },
        { ...vegItem, type: "veggie" },
      ];

      localStorage.setItem("dailyMenuDate", today);
      localStorage.setItem(
        "dailyMenuItems",
        JSON.stringify(items.map((i) => i.id)),
      );
    }

    homeContainer.innerHTML = items
      .map(
        (item) => `
  <div class="menu-item featured ${item.type}" data-id="${item.id}">
    <div class="menu-daily">
      <img src="${item.image}" alt="">
      <div class="menu-daily-tipp"><br /></div>
    </div>
    <h2>${item.name}</h2>
  </div>
`,
      )
      .join("");

    homeContainer.querySelectorAll(".menu-item").forEach((el) => {
      el.addEventListener("click", () => {
        const id = el.getAttribute("data-id");

        const menuTab = document.querySelector('.tab[data-page="menu"]');
        menuTab.click();

        setTimeout(() => {
          openMenuDetailById(id);
        }, 50);
      });
    });
  }

  renderHomeRandom();
});
