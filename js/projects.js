(function () {
  const mounts = document.querySelectorAll("[data-projects]");
  const productMounts = document.querySelectorAll("[data-products]");
  if (!mounts.length && !productMounts.length) return;

  const apiUrl = "https://api.github.com/users/MukeshThummar/repos?per_page=100&sort=updated";

  function normalizeName(name) {
    return String(name).toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  async function getProjects() {
    const fallback = await window.portfolioData.loadJson("data/projects.json");
    try {
      const response = await fetch(apiUrl, { headers: { Accept: "application/vnd.github+json" } });
      if (!response.ok) throw new Error("GitHub API unavailable");
      const repos = await response.json();
      const byName = new Map(repos.map((repo) => [normalizeName(repo.name), repo]));
      return fallback.map((project) => {
        const repo = byName.get(normalizeName(project.name));
        if (!repo) return project;
        return {
          ...project,
          description: repo.description || project.description,
          repo: repo.html_url || project.repo,
          demo: repo.homepage || project.demo,
          githubMeta: `${repo.language || project.stack[0] || "Code"} / ${repo.stargazers_count || 0} stars / updated ${new Date(repo.updated_at).getFullYear()}`
        };
      });
    } catch (error) {
      return fallback;
    }
  }

  function card(project) {
    return `
      <article class="project-card reveal visible" data-category="${project.category}">
        <div class="project-art" aria-hidden="true"></div>
        <div class="project-meta"><span>${project.category}</span><span>${project.status}</span></div>
        <h3>${project.name}</h3>
        <p>${project.description}</p>
        <div class="project-stack">${project.stack.map((item) => `<span>${item}</span>`).join("")}</div>
        ${project.githubMeta ? `<p class="blog-meta">${project.githubMeta}</p>` : ""}
        <div class="card-actions">
          <a href="${project.repo}" target="_blank" rel="noreferrer">View Repository</a>
          ${project.demo ? `<a href="${project.demo}" target="_blank" rel="noreferrer">Live Demo</a>` : ""}
        </div>
      </article>
    `;
  }

  function productCard(project) {
    return `
      <article class="product-card reveal visible">
        <p class="eyebrow">${project.category}</p>
        <h3>${project.name}</h3>
        <p><strong>Problem:</strong> ${project.problem}</p>
        <p><strong>Solution:</strong> ${project.solution}</p>
        <p><strong>Result:</strong> ${project.result}</p>
        <div class="project-stack">${project.stack.map((item) => `<span>${item}</span>`).join("")}</div>
        <div class="card-actions"><a href="${project.repo}" target="_blank" rel="noreferrer">View Project</a>${project.demo ? `<a href="${project.demo}" target="_blank" rel="noreferrer">Live Demo</a>` : ""}</div>
      </article>
    `;
  }

  function renderFilters(projects) {
    const filterMounts = document.querySelectorAll("[data-project-filters]");
    const categories = ["All", ...new Set(projects.map((project) => project.category))];
    filterMounts.forEach((mount) => {
      mount.innerHTML = categories.map((category) => `<button class="filter-btn ${category === "All" ? "active" : ""}" type="button" data-project-filter="${category}">${category}</button>`).join("");
    });
  }

  getProjects().then((projects) => {
    renderFilters(projects);
    mounts.forEach((mount) => {
      const showAll = mount.dataset.showAll === "true";
      const list = showAll ? projects : projects.filter((project) => project.featured).slice(0, 6);
      mount.innerHTML = list.map(card).join("");
    });
    productMounts.forEach((mount) => {
      mount.innerHTML = projects.filter((project) => project.product).slice(0, 4).map(productCard).join("");
    });

    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-project-filter]");
      if (!button) return;
      const category = button.dataset.projectFilter;
      document.querySelectorAll("[data-project-filter]").forEach((item) => item.classList.toggle("active", item.dataset.projectFilter === category));
      document.querySelectorAll(".project-card").forEach((item) => {
        item.hidden = category !== "All" && item.dataset.category !== category;
      });
    });
  }).catch(() => {
    mounts.forEach((mount) => { mount.innerHTML = "<p>Projects are temporarily unavailable.</p>"; });
  });
})();
