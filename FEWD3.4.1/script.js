const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const results = document.getElementById("results");
const resultCount = document.getElementById("result-count");
const emptyState = document.getElementById("empty-state");

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const query = searchInput.value.trim();
  if (!query) {
    return;
  }

  results.innerHTML = "";

  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&generator=search" +
    `&gsrsearch=${encodeURIComponent(query)}` +
    "&gsrnamespace=6&gsrlimit=24&prop=imageinfo&iiprop=url&iiurlwidth=640&format=json&origin=*";
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Image search failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const pages = Object.values(data.query?.pages ?? {});
  let renderedCount = 0;

  for (const page of pages) {
    const imageInfo = page.imageinfo?.[0];
    if (!imageInfo) {
      continue;
    }

    const title = page.title.replace(/^File:/, "").replace(/_/g, " ");
    const card = document.createElement("article");
    card.className = "result-card";

    const link = document.createElement("a");
    link.className = "result-card-link";
    link.href = imageInfo.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", `Open full image: ${title}`);

    const image = document.createElement("img");
    image.src = imageInfo.thumburl || imageInfo.url;
    image.alt = title;
    image.loading = "lazy";

    const caption = document.createElement("p");
    caption.className = "result-card-caption";
    caption.textContent = title;

    link.appendChild(image);
    link.appendChild(caption);
    card.appendChild(link);
    results.appendChild(card);
    renderedCount += 1;
  }

  resultCount.textContent = `Showing ${renderedCount} ${
    renderedCount === 1 ? "image" : "images"
  } for “${query}”`;
  emptyState.hidden = renderedCount > 0;
});
