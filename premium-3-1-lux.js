// Premium 3.1 Lux Brown – gyorsabb belépés + finomítás
window.addEventListener("load", () => {
  const loader = document.getElementById("p3Loader");
  if (loader) {
    loader.classList.add("fast-hide");
    setTimeout(() => loader.classList.add("hide"), 420);
    setTimeout(() => loader.remove(), 950);
  }
});

// ha a régi script később is próbálja rejteni, nem gond
