(function(){
  function ready(fn){
    if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  function closeAll(){
    document.querySelectorAll(".site-menu-open").forEach(function(nav){
      nav.classList.remove("site-menu-open");
      var btn = nav.querySelector(".site-menu-toggle");
      if(btn){
        btn.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
        btn.setAttribute("aria-label", "Menü megnyitása");
      }
    });
  }

  function initOne(nav){
    var menu = nav.querySelector(".f33-menu, .navlinks");
    if(!menu) return;

    var btn = nav.querySelector(".site-menu-toggle");
    if(!btn){
      btn = document.createElement("button");
      btn.type = "button";
      btn.className = "site-menu-toggle";
      btn.setAttribute("aria-label", "Menü megnyitása");
      btn.setAttribute("aria-expanded", "false");
      btn.innerHTML = "<span></span><span></span><span></span>";
      var brand = nav.querySelector(".f33-brand, .brand");
      if(brand && brand.nextSibling) nav.insertBefore(btn, brand.nextSibling);
      else nav.insertBefore(btn, menu);
    }

    if(btn.dataset.ready === "1") return;
    btn.dataset.ready = "1";

    function setOpen(open){
      closeAll();
      if(open){
        nav.classList.add("site-menu-open");
        btn.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
        btn.setAttribute("aria-label", "Menü bezárása");
      }
    }

    btn.addEventListener("click", function(e){
      e.preventDefault();
      e.stopPropagation();
      setOpen(!nav.classList.contains("site-menu-open"));
    });

    menu.addEventListener("click", function(e){
      if(e.target && e.target.closest && e.target.closest("a")){
        setOpen(false);
      }
    });

    document.addEventListener("click", function(e){
      if(!nav.contains(e.target)){
        setOpen(false);
      }
    });

    document.addEventListener("keydown", function(e){
      if(e.key === "Escape") closeAll();
    });

    window.addEventListener("resize", function(){
      if(window.innerWidth > 900) closeAll();
    });
  }

  function initMenus(){
    document.querySelectorAll(".f33-nav, .topbar").forEach(initOne);
  }

  ready(initMenus);
  window.addEventListener("load", initMenus);
  setTimeout(initMenus, 300);
  setTimeout(initMenus, 1200);
})();