// FINAL mobil menü javítás
// Ez a fájl nem változtat tartalmat, csak mobilon egy stabil, fix jobb felső menügombot hoz létre.
(function(){
  function ready(fn){
    if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  function findMenu(){
    return document.querySelector(".f33-menu") || document.querySelector(".navlinks");
  }

  function init(){
    var menu = findMenu();
    if(!menu || document.getElementById("cs-final-mobile-menu-btn")) return;

    var btn = document.createElement("button");
    btn.id = "cs-final-mobile-menu-btn";
    btn.type = "button";
    btn.setAttribute("aria-label", "Menü megnyitása");
    btn.setAttribute("aria-expanded", "false");
    btn.innerHTML = "<span></span><span></span><span></span>";
    document.body.appendChild(btn);

    // A meglévő menüt nem mozgatjuk el véglegesen, csak mobilon kap fix panel kinézetet.
    menu.classList.add("cs-final-mobile-menu-panel");

    function isOpen(){
      return document.body.classList.contains("cs-mobile-menu-open");
    }

    function setOpen(open){
      document.body.classList.toggle("cs-mobile-menu-open", open);
      btn.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", open ? "Menü bezárása" : "Menü megnyitása");
    }

    btn.addEventListener("click", function(e){
      e.preventDefault();
      e.stopPropagation();
      setOpen(!isOpen());
    });

    menu.addEventListener("click", function(e){
      if(e.target && e.target.closest && e.target.closest("a")){
        setOpen(false);
      }
    });

    document.addEventListener("click", function(e){
      if(!isOpen()) return;
      if(e.target === btn || btn.contains(e.target) || menu.contains(e.target)) return;
      setOpen(false);
    });

    document.addEventListener("keydown", function(e){
      if(e.key === "Escape") setOpen(false);
    });

    window.addEventListener("resize", function(){
      if(window.innerWidth > 900) setOpen(false);
    });
  }

  ready(init);
  window.addEventListener("load", init);
  setTimeout(init, 300);
  setTimeout(init, 1200);
})();