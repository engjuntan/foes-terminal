// The GM/player screens each re-render by replacing #main-viewport's
// innerHTML wholesale, which resets scrollTop on every scrollable
// element inside it — not just the viewport itself, since most screens
// actually scroll a nested `.panel`. These helpers save and restore
// scroll positions across that kind of full DOM rebuild. Exercised here
// against plain objects shaped like DOM nodes ({ scrollTop, children })
// rather than a real browser, per house style for pure-logic tests.
import { describe, it, expect } from 'vitest';
import { captureScrollPositions, restoreScrollPositions } from '../src/scrollUtil.js';

function node(scrollTop, children = []) {
  return { scrollTop, children };
}

describe('captureScrollPositions', () => {
  it('records the root itself when the root is what scrolled', () => {
    const root = node(120);
    expect(captureScrollPositions(root)).toEqual([{ path: [], scrollTop: 120 }]);
  });

  it('records a scrolled descendant while the root sits at 0 (the character-creation case)', () => {
    // #main-viewport (0) > .dashboard-container (0) > .panel (240) — the
    // registration screen's actual scrolling element is the nested panel.
    const panel = node(240);
    const dashboardContainer = node(0, [panel]);
    const root = node(0, [dashboardContainer]);
    expect(captureScrollPositions(root)).toEqual([{ path: [0, 0], scrollTop: 240 }]);
  });

  it('ignores elements still at scrollTop 0', () => {
    const root = node(0, [node(0), node(0, [node(0)])]);
    expect(captureScrollPositions(root)).toEqual([]);
  });

  it('records every scrolled element, not just the first one found', () => {
    const left = node(10);
    const right = node(30);
    const root = node(0, [left, right]);
    expect(captureScrollPositions(root)).toEqual([
      { path: [0], scrollTop: 10 },
      { path: [1], scrollTop: 30 },
    ]);
  });

  it('returns an empty list for a missing root instead of throwing', () => {
    expect(captureScrollPositions(null)).toEqual([]);
    expect(captureScrollPositions(undefined)).toEqual([]);
  });
});

describe('restoreScrollPositions', () => {
  it('re-applies a saved position onto the same path in a freshly rebuilt tree', () => {
    const oldPanel = node(240);
    const oldRoot = node(0, [node(0, [oldPanel])]);
    const saved = captureScrollPositions(oldRoot);

    // A brand new tree, same shape, standing in for the DOM after
    // innerHTML was replaced — scrollTop resets to 0 on rebuild.
    const newPanel = node(0);
    const newRoot = node(0, [node(0, [newPanel])]);
    restoreScrollPositions(newRoot, saved);

    expect(newPanel.scrollTop).toBe(240);
  });

  it('restores multiple positions independently', () => {
    const saved = [{ path: [0], scrollTop: 10 }, { path: [1], scrollTop: 30 }];
    const root = node(0, [node(0), node(0)]);
    restoreScrollPositions(root, saved);
    expect(root.children[0].scrollTop).toBe(10);
    expect(root.children[1].scrollTop).toBe(30);
  });

  it('skips a path that no longer resolves instead of throwing (structure changed)', () => {
    const saved = [{ path: [0, 3], scrollTop: 99 }];
    const root = node(0, [node(0, [node(0)])]); // only one child at [0][*]
    expect(() => restoreScrollPositions(root, saved)).not.toThrow();
  });

  it('does nothing on a missing root or an empty/missing saved list', () => {
    const root = node(0, [node(5)]);
    expect(() => restoreScrollPositions(null, [{ path: [0], scrollTop: 5 }])).not.toThrow();
    expect(() => restoreScrollPositions(root, undefined)).not.toThrow();
    restoreScrollPositions(root, []);
    expect(root.children[0].scrollTop).toBe(5); // untouched
  });
});
