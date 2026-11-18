(function () {
  var section = document.getElementById("projects");
  if (!section) return;

  var items = Array.prototype.slice.call(section.querySelectorAll(".project, .small"));
  var toggles = Array.prototype.slice.call(section.querySelectorAll(".small details"));
  var buttons = Array.prototype.slice.call(section.querySelectorAll(".filters button"));
  var status = document.getElementById("filter-status");
  var otherTitle = document.getElementById("other-title");

  function matches(el, f) {
    return f === "all" || el.getAttribute("data-cats").split(" ").indexOf(f) !== -1;
  }

  // Any filter other than All shows every match in the full project format.
  // All goes back to the default view, with every "More info" closed.
  function applyFilter(next) {
    var filtered = next !== "all";
    var shown = 0;
    items.forEach(function (el) {
      var show = matches(el, next);
      el.hidden = !show;
      if (show) shown += 1;
    });
    section.classList.toggle("filtered", filtered);
    if (otherTitle) otherTitle.hidden = filtered;
    toggles.forEach(function (d) {
      if (filtered) d.setAttribute("open", "");
      else d.removeAttribute("open");
    });
    buttons.forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-filter") === next));
    });
    if (status) {
      status.textContent = filtered ? "Showing " + shown + " of " + items.length + " projects." : "";
    }
  }

  buttons.forEach(function (b) {
    b.addEventListener("click", function () {
      applyFilter(b.getAttribute("data-filter"));
    });
  });
})();
