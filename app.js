(function () {
  var root = document.documentElement;
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var el = function (tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var lang = I18N[root.lang] ? root.lang : "tr";

  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function waUrl(text) { return "https://wa.me/" + CONTACT.whatsapp + "?text=" + encodeURIComponent(text); }

  /* ---------- reveal on scroll ---------- */
  var io = "IntersectionObserver" in window && !reduce
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          en.target.classList.add("in");
          io.unobserve(en.target);
        });
      }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 })
    : null;
  function watch(nodes) {
    nodes.forEach(function (n) {
      if (io) io.observe(n); else n.classList.add("in");
    });
  }

  /* ---------- builders ---------- */
  function fill(list, items, build, reveal) {
    list.textContent = "";
    items.forEach(function (it, i) {
      var node = build(it, i);
      if (reveal) { node.setAttribute("data-reveal", ""); node.style.setProperty("--d", i); }
      list.appendChild(node);
    });
    if (reveal) watch(Array.prototype.slice.call(list.children));
  }

  function buildTitle(text) {
    var h = $("#heroTitle");
    h.textContent = "";
    // *word* becomes an accent-colored span; everything else stays plain text.
    text.split(/(\*[^*]+\*)/).forEach(function (part) {
      if (!part) return;
      if (part.charAt(0) === "*") h.appendChild(el("span", "acc", part.slice(1, -1)));
      else h.appendChild(document.createTextNode(part));
    });
  }

  function buildSelect(select, placeholder, options) {
    var prev = select.selectedIndex;
    select.textContent = "";
    var ph = el("option", "", placeholder);
    ph.value = ""; ph.disabled = true; ph.selected = true;
    select.appendChild(ph);
    options.forEach(function (o, i) {
      var opt = el("option", "", o);
      opt.value = String(i);
      select.appendChild(opt);
    });
    if (prev > 0 && prev < select.options.length) select.selectedIndex = prev;
  }

  /* ---------- language ---------- */
  function setLang(next) {
    lang = next;
    var t = I18N[lang];
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = t.title;
    $('meta[name="description"]').content = t.desc;

    $$("[data-i18n]").forEach(function (n) { n.textContent = t[n.dataset.i18n]; });
    $$("[data-i18n-alt]").forEach(function (n) { n.alt = t[n.dataset.i18nAlt]; });
    $$("[data-i18n-aria]").forEach(function (n) { n.setAttribute("aria-label", t[n.dataset.i18nAria]); });
    $$("[data-i18n-ph]").forEach(function (n) { n.placeholder = t[n.dataset.i18nPh]; });
    $$(".lang button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.lang === lang)); });

    buildTitle(t.heroTitle);

    fill($("#expList"), t.expertise, function (it, i) {
      var li = el("li");
      li.appendChild(el("span", "n", String(i + 1).padStart(2, "0")));
      li.appendChild(el("h3", "", it[0]));
      li.appendChild(el("p", "", it[1]));
      return li;
    }, true);

    fill($("#stepList"), t.steps, function (it, i) {
      var li = el("li");
      li.appendChild(el("span", "big", String(i + 1).padStart(2, "0")));
      li.appendChild(el("h3", "", it[0]));
      li.appendChild(el("p", "", it[1]));
      return li;
    }, true);

    fill($("#chipList"), t.complaints, function (it, i) {
      var li = el("li");
      var b = el("button", "", it);
      b.type = "button";
      b.addEventListener("click", function () { pickConcern(i); });
      li.appendChild(b);
      return li;
    }, false);

    fill($("#techList"), t.techniques, function (it) { return el("li", "", it); }, true);

    fill($("#eduList"), t.education, function (it) {
      var li = el("li", it.now ? "now" : "");
      li.appendChild(el("p", "when", it.when));
      li.appendChild(el("h3", "", it.what));
      li.appendChild(el("p", "where", it.where));
      if (it.note) li.appendChild(el("p", "note", it.note));
      return li;
    }, true);

    fill($("#courseList"), t.courses, function (it) { return el("li", "", it); }, true);

    buildSelect($("#fConcern"), t.fConcernPh, t.complaints.concat(t.other));
    buildSelect($("#fTime"), t.fTimePh, t.times);

    $("#waFloat").href = waUrl(t.waFloatMsg);
    $("#formError").hidden = true;
    store("lang", lang);
    onScroll();
  }

  /* ---------- theme ---------- */
  $("#themeBtn").addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    store("theme", next);
  });

  /* ---------- contact ---------- */
  $("#telText").textContent = CONTACT.phoneDisplay;
  $("#waText").textContent = CONTACT.phoneDisplay;
  $("#mailText").textContent = CONTACT.email;
  $("#telLink").href = "tel:" + CONTACT.phoneDial;
  $("#waLink").href = "https://wa.me/" + CONTACT.whatsapp;
  $("#mailLink").href = "mailto:" + CONTACT.email;

  /* ---------- booking form ---------- */
  function pickConcern(i) {
    $("#fConcern").selectedIndex = i + 1;
    $("#booking").scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    setTimeout(function () { $("#fName").focus({ preventScroll: true }); }, reduce ? 0 : 700);
  }

  $("#bookForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var t = I18N[lang];
    var name = $("#fName").value.trim();
    var phone = $("#fPhone").value.trim();
    var digits = phone.replace(/\D/g, "");
    var nameOk = name.length >= 2, phoneOk = digits.length >= 7;
    $("#fName").parentNode.classList.toggle("invalid", !nameOk);
    $("#fPhone").parentNode.classList.toggle("invalid", !phoneOk);
    var err = $("#formError");
    if (!nameOk || !phoneOk) {
      err.textContent = t.fError;
      err.hidden = false;
      (nameOk ? $("#fPhone") : $("#fName")).focus();
      return;
    }
    err.hidden = true;
    var c = $("#fConcern"), tm = $("#fTime"), note = $("#fNote").value.trim();
    var lines = [t.msgIntro, "", t.mName + ": " + name, t.mPhone + ": " + phone];
    if (c.value) lines.push(t.mConcern + ": " + c.options[c.selectedIndex].text);
    if (tm.value) lines.push(t.mTime + ": " + tm.options[tm.selectedIndex].text);
    if (note) lines.push(t.mNote + ": " + note);
    window.open(waUrl(lines.join("\n")), "_blank", "noopener");
  });
  ["#fName", "#fPhone"].forEach(function (s) {
    $(s).addEventListener("input", function () { this.parentNode.classList.remove("invalid"); });
  });

  /* ---------- menu ---------- */
  var nav = $("#nav"), menuBtn = $("#menuBtn");
  menuBtn.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });
  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") { nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); }
  });

  /* ---------- scroll-driven bits ---------- */
  var top = $(".top"), wa = $("#waFloat"), booking = $("#booking");
  var sections = ["expertise", "process", "osteopathy", "education", "booking", "location"].map(function (id) { return document.getElementById(id); });
  var navLinks = $$(".nav a");
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var y = scrollY, vh = innerHeight;
      var max = document.documentElement.scrollHeight - vh;
      var p = max > 0 ? Math.min(1, y / max) : 0;
      root.style.setProperty("--p", p.toFixed(4));

      top.classList.toggle("scrolled", y > 8);
      var br = booking.getBoundingClientRect();
      var inBooking = br.top < vh * 0.7 && br.bottom > vh * 0.3;
      wa.classList.toggle("show", y > vh * 0.6 && !inBooking);

      var current = null;
      sections.forEach(function (sec) { if (sec.getBoundingClientRect().top < vh * 0.4) current = sec.id; });
      navLinks.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + current); });
    });
  }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);

  /* ---------- boot ---------- */
  $$(".lang button").forEach(function (b) {
    b.addEventListener("click", function () { if (b.dataset.lang !== lang) setLang(b.dataset.lang); });
  });
  $("#year").textContent = new Date().getFullYear();
  setLang(lang);
  watch($$("[data-reveal]:not(.in)"));

  // Start the hero entrance on the next frame; the timer covers background tabs,
  // where animation frames are paused and the hero would otherwise stay hidden.
  function ready() { root.classList.add("ready"); }
  requestAnimationFrame(function () { requestAnimationFrame(ready); });
  setTimeout(ready, 80);
})();
