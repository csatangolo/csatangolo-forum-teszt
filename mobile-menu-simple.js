(function(){
  function initMobileMenus(){
    document.querySelectorAll(".topbar").forEach(function(nav){
      var btn = nav.querySelector(".topbar-menu-toggle");
      var menu = nav.querySelector(".navlinks");
      if(!btn || !menu || btn.dataset.ready === "1") return;
      btn.dataset.ready = "1";

      function closeAll(){
        document.querySelectorAll(".topbar.is-menu-open").forEach(function(openNav){
          openNav.classList.remove("is-menu-open");
          var openBtn = openNav.querySelector(".topbar-menu-toggle");
          if(openBtn){
            openBtn.classList.remove("is-open");
            openBtn.setAttribute("aria-expanded", "false");
            openBtn.setAttribute("aria-label", "Menü megnyitása");
          }
        });
      }

      function setOpen(open){
        closeAll();
        if(open){
          nav.classList.add("is-menu-open");
          btn.classList.add("is-open");
          btn.setAttribute("aria-expanded", "true");
          btn.setAttribute("aria-label", "Menü bezárása");
        }
      }

      btn.addEventListener("click", function(e){
        e.preventDefault();
        e.stopPropagation();
        setOpen(!nav.classList.contains("is-menu-open"));
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
        if(e.key === "Escape") setOpen(false);
      });

      window.addEventListener("resize", function(){
        if(window.innerWidth > 900) setOpen(false);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", initMobileMenus);
  window.addEventListener("load", initMobileMenus);
  setTimeout(initMobileMenus, 300);
})();