(function () {
  const root = document.documentElement;
  const savedTheme = localStorage.getItem("theme");
  const preferredLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
  const initialTheme = savedTheme || (preferredLight ? "light" : "dark");

  function setTheme(theme) {
    root.dataset.theme = theme;
    localStorage.setItem("theme", theme);
    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      button.querySelector(".theme-icon").textContent = theme === "dark" ? "☼" : "☾";
      button.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} theme`);
    });
  }

  setTheme(initialTheme);

  document.addEventListener("click", (event) => {
    const themeButton = event.target.closest("[data-theme-toggle]");
    if (themeButton) setTheme(root.dataset.theme === "dark" ? "light" : "dark");

    const toggle = event.target.closest("[data-nav-toggle]");
    if (toggle) {
      const menu = document.querySelector("[data-nav-menu]");
      const isOpen = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    }

    const menuLink = event.target.closest("[data-nav-menu] a");
    if (menuLink) {
      const menu = menuLink.closest("[data-nav-menu]");
      const menuToggle = document.querySelector("[data-nav-toggle]");
      menu.classList.remove("open");
      menuToggle?.setAttribute("aria-expanded", "false");
    }
  });

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("visible"));
  }

  const sections = Array.from(document.querySelectorAll("main section[id]"));
  const navLinks = Array.from(document.querySelectorAll(".nav-menu a[href^='#']"));
  if (sections.length && "IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`));
      });
    }, { rootMargin: "-35% 0px -55% 0px" });
    sections.forEach((section) => navObserver.observe(section));
  }

  async function loadJson(path) {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Unable to load ${path}`);
    return response.json();
  }

  window.portfolioData = { loadJson };

  const skillMount = document.querySelector("[data-skills]");
  if (skillMount) {
    loadJson("data/skills.json").then((groups) => {
      skillMount.innerHTML = groups.map((group) => `
        <article class="skill-card reveal visible">
          <h3>${group.category}</h3>
          <div class="skill-list">${group.items.map((item) => `<span>${item}</span>`).join("")}</div>
        </article>
      `).join("");
    }).catch(() => {
      skillMount.innerHTML = "<p>Skills are temporarily unavailable.</p>";
    });
  }
})();
