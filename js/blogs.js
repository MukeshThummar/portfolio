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
          <a aria-disabled="true">Draft idea</a>
          ${post.source ? `<a href="${post.source}" target="_blank" rel="noreferrer">Reference</a>` : ""}
        </div>
      </article>
    `;
  }

  window.portfolioData.loadJson("data/blogs.json").then((posts) => {
    mounts.forEach((mount) => { mount.innerHTML = posts.map(renderCard).join(""); });

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
