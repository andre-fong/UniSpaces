export function generatePageList(pages, current) {
  // Page list does not need to be processed if there are less than 6 pages
  if (pages.length <= 5) return pages;

  // If there are more than 6 pages, process the page list
  const n = pages.length;

  // If current is first or last page, return 1, 2, ..., n-1, n
  if (current === 1 || current === pages.length) return [1, 2, "...", n - 1, n];

  // Else follow the following rules:
  // 1. First and last page are always included
  // 2. Include pages around current page
  // 3. Exclude the rest of the pages with ...

  const newPages = [];
  pages.forEach((page) => {
    if (page === 1 || page === n) {
      newPages.push(page);
    } else if (
      page === current - 1 ||
      page === current ||
      page === current + 1
    ) {
      newPages.push(page);
    } else if (newPages[newPages.length - 1] !== "...") {
      newPages.push("...");
    }
  });

  return newPages;
}
