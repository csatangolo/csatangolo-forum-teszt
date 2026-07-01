(function(){
  function ready(fn){
    if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  function ensureOverlay(){
    var overlay = document.querySelector(".site-menu-overlay");
    if(!overlay){
      overlay = document.createElement("div");
      overlay.className = "site-menu-overlay";
      document.body.appendChild(overlay);
      overlay.addEventListener("click", closeAll);
    }
    return overlay;
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
    document.body.classList.remove("site-menu-active");
  }

  function markActive(menu){
    var path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    menu.querySelectorAll("a").forEach(function(a){
      var href = (a.getAttribute("href") || "").split("#")[0].split("?")[0].toLowerCase();
      if(!href) return;
      if(href === path || (path === "" && href === "index.html")){
        a.classList.add("is-active");
      }
    });
  }

  function initOne(nav){
    var menu = nav.querySelector(".f33-menu, .navlinks");
    if(!menu) return;

    nav.classList.add("csat-nav-v2");
    markActive(menu);

    var brand = nav.querySelector(".f33-brand, .brand");
    if(brand && !brand.querySelector(".csat-brand-mark")){
      brand.classList.add("csat-brand-v2");
      if(!brand.querySelector(".f33-logo")){
        brand.insertAdjacentHTML("afterbegin", '<span class="csat-brand-mark" aria-hidden="true">🐴</span>');
      }
    }

    var btn = nav.querySelector(".site-menu-toggle");
    if(!btn){
      btn = document.createElement("button");
      btn.type = "button";
      btn.className = "site-menu-toggle";
      btn.setAttribute("aria-label", "Menü megnyitása");
      btn.setAttribute("aria-expanded", "false");
      btn.innerHTML = "<span></span><span></span><span></span>";
      if(brand && brand.nextSibling) nav.insertBefore(btn, brand.nextSibling);
      else nav.insertBefore(btn, menu);
    }

    if(!menu.querySelector(".mobile-menu-title")){
      menu.insertAdjacentHTML("afterbegin", '<div class="mobile-menu-title"><strong>Csatangoló</strong><small>Menü</small></div>');
    }

    ensureOverlay();

    if(btn.dataset.ready === "1") return;
    btn.dataset.ready = "1";

    function setOpen(open){
      closeAll();
      if(open){
        nav.classList.add("site-menu-open");
        btn.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
        btn.setAttribute("aria-label", "Menü bezárása");
        document.body.classList.add("site-menu-active");
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

    document.addEventListener("keydown", function(e){
      if(e.key === "Escape") closeAll();
    });

    window.addEventListener("resize", function(){
      if(window.innerWidth > 900) closeAll();
    });
  }

  function onScroll(){
    document.documentElement.classList.toggle("nav-scrolled", window.scrollY > 16);
  }

  function initMenus(){
    document.querySelectorAll(".f33-nav, .topbar").forEach(initOne);
    onScroll();
  }

  ready(initMenus);
  window.addEventListener("load", initMenus);
  window.addEventListener("scroll", onScroll, { passive:true });
  setTimeout(initMenus, 300);
  setTimeout(initMenus, 1200);
})();
