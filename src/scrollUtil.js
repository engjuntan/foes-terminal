// src/scrollUtil.js
//
// main.js's render() replaces #main-viewport's innerHTML wholesale on
// every re-render, which resets scrollTop to 0 on every scrollable
// element inside it — not just #main-viewport itself. Most screens use
// the 3-panel dashboard-container/.panel layout, where each `.panel` is
// the thing that actually scrolls (overflow-y: auto) while
// #main-viewport never does; a screen like character creation nests a
// single scrolling `.panel` even deeper. Tracking only
// #main-viewport.scrollTop (as the old code did) misses all of these,
// which is why clicking a tag skill during character creation jumped
// the page back to the top.
//
// These two functions are plain DOM-shape helpers (they only touch
// `.scrollTop` and `.children`/`.parentElement`), factored out so they
// can be unit tested without a real browser: any object with those
// properties behaves the same way a live DOM node would here.

// Records the scrollTop of every scrolled element under (and including)
// `root`, as a path of child-indexes from `root` down to that element.
// Elements sitting at scrollTop 0 aren't recorded — there's nothing to
// restore, and it keeps the result small.
export function captureScrollPositions(root) {
  if (!root) return [];
  const positions = [];
  const walk = (el, path) => {
    if (el.scrollTop > 0) positions.push({ path, scrollTop: el.scrollTop });
    const children = el.children || [];
    for (let i = 0; i < children.length; i++) walk(children[i], path.concat(i));
  };
  walk(root, []);
  return positions;
}

// Re-applies previously captured positions to whatever now occupies the
// same child-index path under `root`. Safe to call after `root`'s
// contents have been fully replaced (e.g. innerHTML = ...) as long as
// the new markup has the same shape at that path — if a path no longer
// resolves to a real element (structure changed), it's silently skipped
// rather than throwing.
export function restoreScrollPositions(root, positions) {
  if (!root || !positions) return;
  positions.forEach(({ path, scrollTop }) => {
    let node = root;
    for (const index of path) {
      const children = node && node.children;
      if (!children || !children[index]) { node = null; break; }
      node = children[index];
    }
    if (node) node.scrollTop = scrollTop;
  });
}
