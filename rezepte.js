let menuData = [];

const listEl = document.getElementById("menu-list");
const detailEl = document.getElementById("menu-detail");

/* =====================
   Menü laden & rendern
===================== */
export async function loadMenu() {
  if (!menuData.length) {
    const res = await fetch("menu.json");
    menuData = await res.json();
  }

  renderList();
}

/* =====================
   Detail direkt öffnen
===================== */
export function openMenuDetailById(id) {
  if (!menuData.length) return;
  openDetail(id);
}

/* =====================
   Detail zurücksetzen
===================== */
export function clearMenuDetail() {
  detailEl.innerHTML = "";
  detailEl.classList.remove("active");
}

/* =====================
   Liste rendern
===================== */
function renderList() {
  listEl.innerHTML = menuData
    .map(
      (item) => `
        <div class="menu-item" data-id="${item.id}">
          <img src="${item.image}">
          <h2>${item.name}</h2>
        </div>
      `,
    )
    .join("");

  listEl.querySelectorAll(".menu-item").forEach((el) => {
    el.addEventListener("click", () => openDetail(Number(el.dataset.id)));
  });
}

/* =====================
   Detail öffnen und schliessen
===================== */
let startX = 0;
let currentX = 0;
let isSwiping = false;

function openDetail(id) {
  const item = menuData.find((i) => i.id === id);
  if (!item) return;

  detailEl.innerHTML = `
    <button id="backBtn">< Zurück</button>
    <img class="rimg" src="${item.image}">
    <h1>${item.name}</h1>
    <p>${item.description}</p>
  `;

  detailEl.classList.add("active");

  document.getElementById("backBtn").addEventListener("click", closeDetail);
}

/* --- SCHLIESSEN --- */
function closeDetail() {
  detailEl.classList.remove("active");
  detailEl.style.transform = "";
}

/* --- SWIPE GESTEN --- */
detailEl.addEventListener("touchstart", (e) => {
  if (!detailEl.classList.contains("active")) return;

  startX = e.touches[0].clientX;
  isSwiping = true;
  detailEl.style.transition = "none";
});

detailEl.addEventListener("touchmove", (e) => {
  if (!isSwiping) return;

  currentX = e.touches[0].clientX;
  const deltaX = currentX - startX;

  if (deltaX > 0) {
    detailEl.style.transform = `translateX(${deltaX}px)`;
  }
});

detailEl.addEventListener("touchend", () => {
  if (!isSwiping) return;
  isSwiping = false;

  const deltaX = currentX - startX;
  const threshold = window.innerWidth * 0.3;

  detailEl.style.transition = "transform 0.25s ease";

  if (deltaX > threshold) {
    detailEl.style.transform = "translateX(100%)";

    setTimeout(() => {
      closeDetail();
    }, 250);
  } else {
    detailEl.style.transform = "translateX(0)";
  }
});

