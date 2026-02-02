let registrationRef = null;

// Service Worker registrieren
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js");

  navigator.serviceWorker.ready.then((registration) => {
    registrationRef = registration;

    // Falls Update schon wartet
    if (registration.waiting) {
      handleUpdate(registration);
    }

    // Update erkennen
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      newWorker.addEventListener("statechange", () => {
        if (
          newWorker.state === "installed" &&
          navigator.serviceWorker.controller
        ) {
          handleUpdate(registration);
        }
      });
    });
  });

  // Nach Aktivierung neu laden
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    window.location.reload();
  });
}

// Update-Logik
function handleUpdate(registration) {
  const autoUpdate = localStorage.getItem("autoUpdate") === "true";

  if (autoUpdate) {
    registration.waiting.postMessage("SKIP_WAITING");
  } else {
    document.getElementById("updateToast").hidden = false;
  }
}

// Button: Jetzt updaten
document.getElementById("updateBtn").addEventListener("click", () => {
  if (registrationRef?.waiting) {
    registrationRef.waiting.postMessage("SKIP_WAITING");
  }
});

// Auto-Update Toggle
const toggle = document.getElementById("autoUpdateToggle");
toggle.checked = localStorage.getItem("autoUpdate") === "true";

toggle.addEventListener("change", () => {
  localStorage.setItem("autoUpdate", toggle.checked);
});
//

//Loadscreen
const MIN_LOAD_TIME = 1050; // ms

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
  const remaining = Math.max(0, MIN_LOAD_TIME - elapsed);

  setTimeout(() => {
    loader.classList.add("hide");
    setTimeout(() => loader.remove(), 300);

    app.hidden = false;
  }, remaining);
}

//
document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab");
  const pages = document.querySelectorAll(".page");
  const indicator = document.querySelector(".indicator");

  function updateIndicator(tab) {
    const rect = tab.getBoundingClientRect();
    const barRect = tab.parentElement.getBoundingClientRect();
    indicator.style.transform = `translateX(${rect.left - barRect.left + rect.width / 2 - 20}px)`;
  }

  function switchPage(pageId, tab) {
    // Seiten
    pages.forEach((page) =>
      page.classList.toggle("active", page.id === pageId),
    );

    // Tabs
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    updateIndicator(tab);
  }
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      switchPage(tab.dataset.page, tab);
    });
  });

  // Initial
  const initialTab = document.querySelector(".tab.active");
  requestAnimationFrame(() => updateIndicator(initialTab));

  //Json laden
  let menuData = [];

  fetch("menu.json")
    .then((res) => res.json())
    .then((data) => {
      menuData = data;
    });

  let menuRendered = false;

  function renderList() {
    const app = document.getElementById("menu");
    menuRendered = true; // Flag setzen

    app.innerHTML = menuData
      .map(
        (item) => `
      <div class="item" data-id="${item.id}">
        <img src="${item.image}">
        <h2>${item.name}</h2>
      </div>
    `,
      )
      .join("");

    // Klick auf Items
    app.querySelectorAll(".item").forEach((el) => {
      el.addEventListener("click", () => {
        openDetail(Number(el.dataset.id));
      });
    });
  }

  //Seitenwechsel resetten
  function switchPage(pageId, tab) {
    // Seiten aktiv/inaktiv setzen
    pages.forEach((page) =>
      page.classList.toggle("active", page.id === pageId),
    );

    // Tabs aktiv/inaktiv
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    // Indicator aktualisieren
    updateIndicator(tab);

    // Menü zurücksetzen, wenn wir Menu verlassen
    if (pageId !== "menu") {
      document.getElementById("menu").innerHTML = ""; // DOM leeren
      menuRendered = false; //Flag zurücksetzen
    } else {
      renderList(); //Menü beim Öffnen rendern
    }
  }
  //
  function openDetail(id) {
    const item = menuData.find((i) => i.id === id);
    const app = document.getElementById("menu");

    // Detail-Inhalt einfügen
    app.innerHTML = `
    <button id="backBtn">← Zurück</button>
    <h1>${item.name}</h1>
    <img class="rimg" src="${item.image}">
    <p>${item.description}</p>
  `;

    // EventListener für den Button
    document.getElementById("backBtn").addEventListener("click", () => {
      renderList(); // Liste wiederherstellen
    });
  }
  document.querySelectorAll("#home .item").forEach((item) => {
    item.addEventListener("click", () => {
      const menuTab = document.querySelector('.tab[data-page="menu"]');
      switchPage("menu", menuTab);
      // renderList() wird automatisch in switchPage aufgerufen
    });
  });
});
//
