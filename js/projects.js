(function () {
  const mounts = document.querySelectorAll("[data-projects]");
  if (!mounts.length) return;

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

  function renderSearchSuggestions(projects) {
    const suggestions = [...new Set(projects.flatMap((project) => [project.name, project.category, ...project.stack]))].sort();
    document.querySelectorAll("#project-search-suggestions").forEach((list) => {
      list.innerHTML = suggestions.map((suggestion) => `<option value="${suggestion}"></option>`).join("");
    });
  }

  getProjects().then((projects) => {
    renderSearchSuggestions(projects);
    mounts.forEach((mount) => {
      const showAll = mount.dataset.showAll === "true";
      const list = showAll ? projects : projects.filter((project) => project.featured).slice(0, 6);
      mount.innerHTML = list.map(card).join("");
    });

    function applyProjectFilters() {
      const query = document.querySelector("[data-project-search]")?.value.trim().toLowerCase() || "";
      document.querySelectorAll(".project-card").forEach((item) => {
        const matchesSearch = query.length === 0 || item.textContent.toLowerCase().includes(query);
        item.hidden = !matchesSearch;
      });
    }

    document.querySelectorAll("[data-project-search]").forEach((input) => {
      input.addEventListener("input", () => {
        document.querySelectorAll("[data-project-search]").forEach((other) => {
          if (other !== input) other.value = input.value;
        });
        applyProjectFilters();
      });
    });
  }).catch(() => {
    mounts.forEach((mount) => { mount.innerHTML = "<p>Projects are temporarily unavailable.</p>"; });
  });
})();
