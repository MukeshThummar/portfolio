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
      dialogTitle.textContent = guide.title;
      dialogIntro.textContent = guide.intro;
      dialogContent.innerHTML = guide.sections.map((section) => `
        <article class="guide-section">
          <h3>${section.title}</h3>
          <p>${section.body}</p>
          <pre><code>${section.example}</code></pre>
          <p><strong>Why it matters:</strong> ${section.note}</p>
          <p><strong>Real-time scenario:</strong> ${section.scenario}</p>
        </article>
      `).join("");
      dialog.showModal();
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
