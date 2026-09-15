
(function () {
  var STORAGE_KEY = "stayscape-theme";
  var toggleBtn = document.getElementById("theme-toggle");
 
  if (!toggleBtn) return;
 
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }
 
  toggleBtn.addEventListener("click", function () {
    var current = document.documentElement.getAttribute("data-theme") || "dark";
    applyTheme(current === "dark" ? "light" : "dark");
  });
})();
 