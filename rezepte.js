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
      item => `
        <div class="menu-item" data-id="${item.id}">
          <img src="${item.image}">
          <h2>${item.name}</h2>
        </div>
      `
    )
    .join("");

  listEl.querySelectorAll(".menu-item").forEach(el => {
    el.addEventListener("click", () =>
      openDetail(Number(el.dataset.id))
    );
  });
}

/* =====================
   Detail öffnen
===================== */
function openDetail(id) {
  const item = menuData.find(i => i.id === id);
  if (!item) return;

  detailEl.innerHTML = `
    <button id="backBtn">← Zurück</button>
    <h1>${item.name}</h1>
    <img class="rimg" src="${item.image}">
    <p>${item.description}</p>
  `;

  detailEl.classList.add("active");

  document
    .getElementById("backBtn")
    .addEventListener("click", closeDetail);
}

function closeDetail() {
  detailEl.classList.remove("active");
}
