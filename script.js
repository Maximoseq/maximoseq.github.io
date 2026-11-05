(function () {
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Work filter ---------- */
  var buttons = Array.prototype.slice.call(document.querySelectorAll(".chip-btn"));
  var cases = Array.prototype.slice.call(document.querySelectorAll("#cases > .case"));
  var tocItems = Array.prototype.slice.call(document.querySelectorAll("#toc-work > li"));
  var count = document.getElementById("count");

  function matches(el, filter) {
    return filter === "all" || (el.getAttribute("data-cats") || "").split(" ").indexOf(filter) !== -1;
  }

  function applyFilter(filter) {
    var shown = 0;
    cases.forEach(function (c) {
      var show = matches(c, filter);
      c.hidden = !show;
      // The "in progress" row is a note, not a project, so it isn't counted.
      if (show && !c.classList.contains("case-next")) shown += 1;
    });
    tocItems.forEach(function (li) {
      li.hidden = !matches(li, filter);
    });
    buttons.forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-filter") === filter));
    });
    if (count) count.textContent = shown + (shown === 1 ? " project" : " projects");
  }

  buttons.forEach(function (b) {
    b.addEventListener("click", function () {
      applyFilter(b.getAttribute("data-filter"));
    });
  });

  /* ---------- Scroll spy for the rail ---------- */
  if (!("IntersectionObserver" in window)) return;

  var links = Array.prototype.slice.call(document.querySelectorAll(".toc a[href^='#']"));
  var byId = {};
  links.forEach(function (a) {
    byId[a.getAttribute("href").slice(1)] = a;
  });

  var targets = ["work", "about", "contact"]
    .concat(cases.map(function (c) { return c.id; }))
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  var visible = {};

  function setCurrent() {
    var current = {};
    // Prefer the first visible project; otherwise fall back to the section.
    var order = targets.filter(function (t) { return visible[t.id] && !t.hidden; });
    var project = order.filter(function (t) { return t.classList.contains("case"); })[0];
    var section = order.filter(function (t) { return !t.classList.contains("case"); }).pop();
    if (project) current[project.id] = true;
    if (section) current[section.id] = true;
    if (project) current.work = true;

    links.forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      if (current[id]) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  }

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        visible[e.target.id] = e.isIntersecting;
      });
      setCurrent();
    },
    { rootMargin: "-30% 0px -50% 0px" }
  );

  targets.forEach(function (t) {
    if (byId[t.id]) io.observe(t);
  });
})();
