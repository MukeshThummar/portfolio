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
    document.querySelectorAll("[data-project-suggestions]").forEach((list) => {
      list.dataset.suggestions = JSON.stringify(suggestions);
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
      const suggestionList = input.closest(".project-search-field")?.querySelector("[data-project-suggestions]");
      const getSuggestions = () => JSON.parse(suggestionList?.dataset.suggestions || "[]");
      const renderSuggestions = () => {
        const query = input.value.trim().toLowerCase();
        const matches = getSuggestions().filter((suggestion) => !query || suggestion.toLowerCase().includes(query)).slice(0, 12);
        if (!suggestionList) return;
        suggestionList.innerHTML = matches.map((suggestion) => `<button type="button" role="option" data-search-suggestion="${suggestion}">${suggestion}</button>`).join("");
        suggestionList.hidden = matches.length === 0;
      };

      input.addEventListener("input", () => {
        document.querySelectorAll("[data-project-search]").forEach((other) => {
          if (other !== input) other.value = input.value;
        });
        document.querySelectorAll("[data-project-suggestions]").forEach((other) => { if (other !== suggestionList) other.hidden = true; });
        renderSuggestions();
        applyProjectFilters();
      });
      input.addEventListener("focus", renderSuggestions);
      suggestionList?.addEventListener("click", (event) => {
        const suggestion = event.target.closest("[data-search-suggestion]");
        if (!suggestion) return;
        input.value = suggestion.dataset.searchSuggestion;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        suggestionList.hidden = true;
      });
    });

    document.addEventListener("click", (event) => {
      if (!event.target.closest(".project-search-field")) document.querySelectorAll("[data-project-suggestions]").forEach((list) => { list.hidden = true; });
    });
  }).catch(() => {
    mounts.forEach((mount) => { mount.innerHTML = "<p>Projects are temporarily unavailable.</p>"; });
  });
})();
