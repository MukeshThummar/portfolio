(function () {
  const mounts = document.querySelectorAll("[data-blogs]");
  if (!mounts.length) return;

  function renderCard(post) {
    const description = Array.isArray(post.description) ? post.description : [post.summary];
    return `
      <article class="blog-card reveal visible" data-category="${post.category}">
        <div class="blog-meta"><span>${post.category}</span><span>${post.date}</span><span>${post.readTime}</span></div>
        <h3>${post.title}</h3>
        <p>${post.summary}</p>
        <ul class="blog-description">${description.map((item) => `<li>${item}</li>`).join("")}</ul>
        <div class="blog-tags">${post.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
        <div class="card-actions">
          ${post.guide ? `<button class="blog-more" type="button" data-blog-guide="${post.guide}">View more</button>` : ""}
          ${post.source ? `<a href="${post.source}" target="_blank" rel="noreferrer">Reference</a>` : ""}
        </div>
      </article>
    `;
  }

  window.portfolioData.loadJson("data/blogs.json?v=20260920-2").then((posts) => {
    mounts.forEach((mount) => { mount.innerHTML = posts.map(renderCard).join(""); });

    const dialog = document.querySelector("[data-blog-dialog]");
    const dialogTitle = dialog?.querySelector("[data-blog-dialog-title]");
    const dialogIntro = dialog?.querySelector("[data-blog-dialog-intro]");
    const dialogContent = dialog?.querySelector("[data-blog-dialog-content]");

    function renderGuide(guide) {
      const diagrams = {
        "storage-pages": `<div class="index-diagram storage-diagram" role="img" aria-label="A table split into 8 KB data pages, with rows stored inside each page"><div class="diagram-caption">Table data is stored in 8 KB pages</div><div class="page-stack"><div class="data-page"><b>Page 1 / 8 KB</b><span>Rows 1-200</span><small>narrow rows fit more</small></div><div class="data-page"><b>Page 2 / 8 KB</b><span>Rows 201-400</span><small>row count varies</small></div><div class="data-page"><b>Page 3 / 8 KB</b><span>Rows 401-600</span><small>wide rows fit fewer</small></div></div><div class="diagram-footnote">SQL Server reads pages, not one row at a time. Actual rows per page depend on row size.</div></div>`,
        "clustered-pages": `<div class="index-diagram" role="img" aria-label="A clustered index B-tree with root, intermediate, and leaf data pages"><div class="diagram-caption">Clustered index: root → intermediate → leaf data pages</div><div class="btree"><span class="tree-node root">Root: 1-1200</span><div class="tree-branch"><span class="tree-node">801-1200</span><span class="tree-node">1-400</span><span class="tree-node">401-800</span></div><div class="tree-leaves"><span class="tree-node leaf">Data page: 1-200</span><span class="tree-node leaf">Data page: 201-400</span><span class="tree-node leaf">Data page: 801-1000</span><span class="tree-node leaf">Data page: 1001-1200</span></div></div><div class="diagram-footnote">Root and intermediate levels store keys and pointers; leaf pages store the actual table rows.</div></div>`,
        "index-btree": `<div class="index-diagram" role="img" aria-label="A non-clustered B-tree index with root, branch, and leaf levels pointing to row locations"><div class="diagram-caption">Non-clustered index: key values point to row locations</div><div class="btree"><span class="tree-node root">Root keys: 50 | 80</span><div class="tree-branch"><span class="tree-node">Keys 1-50</span><span class="tree-node">Keys 51-80</span><span class="tree-node">Keys 81-100</span></div><div class="tree-leaves"><span class="tree-node leaf">50 → clustered row</span><span class="tree-node leaf">80 → clustered row</span><span class="tree-node leaf">95 → clustered row</span></div></div><div class="diagram-footnote">The leaf locator leads SQL Server to the clustered row or heap row.</div></div>`,
        "row-lookup": `<div class="index-diagram lookup-diagram" role="img" aria-label="SQL Server finding EmployeeId 1120 by following a root pointer to an intermediate range and leaf data page"><div class="diagram-caption">Example lookup: EmployeeId = 1120</div><div class="lookup-path"><span class="tree-node root">Root<br>1-400 | 401-800 | 801-1200</span><i>→ 801-1200</i><span class="tree-node">Intermediate<br>1001-1200</span><i>→</i><span class="tree-node leaf">Leaf data page<br>Row 1120</span></div><div class="diagram-footnote">The engine follows a few page pointers instead of scanning every data page.</div></div>`,
        "nonclustered-lookup": `<div class="index-diagram lookup-diagram" role="img" aria-label="A non-clustered index seek followed by a key lookup into the clustered index"><div class="diagram-caption">Non-clustered seek → key lookup</div><div class="lookup-path"><span class="tree-node root">Name index<br>ABC 932000</span><i>→ Id 932000</i><span class="tree-node">Clustered index<br>Id 932000</span><i>→</i><span class="tree-node leaf">Full employee row</span></div><div class="diagram-footnote">The non-clustered leaf stores the key locator; the clustered index supplies missing columns.</div></div>`
      };
      dialogTitle.textContent = guide.title;
      dialogIntro.textContent = guide.intro;
      dialogContent.innerHTML = guide.sections.map((section) => `
        <article class="guide-section">
          <h3>${section.title}</h3>
          <p>${section.body}</p>
          ${section.diagram ? diagrams[section.diagram] : ""}
          <div class="query-layout">
            <div class="query-pane">
              <div class="query-pane-header"><span>SQL query</span><button class="copy-query" type="button" data-copy-query aria-label="Copy SQL query" title="Copy SQL query"><span aria-hidden="true">⧉</span><span class="copy-label">Copy</span></button></div>
              <pre><code>${section.example}</code></pre>
            </div>
            ${section.sample || section.parameters || section.output ? `<div class="query-reference">${section.parameters ? `<div><h4>Parameter values</h4><pre><code>${section.parameters}</code></pre></div>` : ""}<div><h4>Sample data</h4><pre><code>${section.sample || "No sample data provided."}</code></pre></div><div><h4>Expected output</h4><pre><code>${section.output || "See the query result."}</code></pre></div></div>` : ""}
          </div>
          <p><strong>Why it matters:</strong> ${section.note}</p>
          <p><strong>Real-time scenario:</strong> ${section.scenario}</p>
        </article>
      `).join("");
      dialogContent.querySelectorAll("[data-copy-query]").forEach((button) => {
        button.addEventListener("click", async () => {
          const query = button.closest(".query-pane").querySelector("code").textContent;
          try {
            if (navigator.clipboard?.writeText) {
              await navigator.clipboard.writeText(query);
            } else {
              const input = document.createElement("textarea");
              input.value = query;
              input.setAttribute("readonly", "");
              input.style.position = "fixed";
              input.style.opacity = "0";
              document.body.appendChild(input);
              input.select();
              if (!document.execCommand("copy")) throw new Error("Copy command failed");
              input.remove();
            }
            button.querySelector(".copy-label").textContent = "Copied";
            setTimeout(() => { button.querySelector(".copy-label").textContent = "Copy"; }, 1600);
          } catch (error) {
            button.querySelector(".copy-label").textContent = "Copy failed";
          }
        });
      });
      dialogContent.scrollTop = 0;
      dialog.showModal();
      requestAnimationFrame(() => { dialogContent.scrollTop = 0; });
    }

    document.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-blog-guide]");
      if (!trigger || !dialog) return;
      window.portfolioData.loadJson(`${trigger.dataset.blogGuide}?v=20260920-2`).then(renderGuide);
    });

    dialog?.addEventListener("click", (event) => {
      if (event.target.closest("[data-dialog-close]")) dialog.close();
      if (event.target === dialog) dialog.close();
    });

    document.querySelectorAll("[data-blog-search]").forEach((input) => {
      input.addEventListener("input", () => {
        const query = input.value.trim().toLowerCase();
        document.querySelectorAll(".blog-card").forEach((card) => {
          const haystack = card.textContent.toLowerCase();
          card.hidden = query.length > 0 && !haystack.includes(query);
        });
      });
    });
  }).catch(() => {
    mounts.forEach((mount) => { mount.innerHTML = "<p>Blog ideas are temporarily unavailable.</p>"; });
  });
})();
