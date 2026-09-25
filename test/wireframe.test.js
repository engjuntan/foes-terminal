// The body wireframe is a second view of data the Status tab already
// shows, so the thing worth testing is that it can never disagree with
// those rows: the same counters, the same resistance, and the same
// answer to "which arm is the crippled one".
import { describe, it, expect } from 'vitest';
import { deriveBodyState, renderBodyWireframe, WIREFRAME_REGIONS, WIREFRAME_STATES } from '../src/wireframe.js';

const fx = (source_id, extra = {}) => ({ id: `${source_id}_1`, source_id, name: source_id, ...extra });

describe('deriveBodyState', () => {
  it('reports every drawn region, even the ones with no injury rules', () => {
    const state = deriveBodyState({}, [], 2);
    expect(Object.keys(state).sort()).toEqual(WIREFRAME_REGIONS.map(r => r.key).sort());
    expect(state.torso.state).toBe('clear');
    expect(state.head.state).toBe('clear');
    // The head has no persisting injury, but it is still the part worth
    // aiming at — the tooltip says why.
    expect(state.head.note).toBe('×1.5 damage on a hit');
    expect(state.torso.note).toBe('No lasting injury');
  });

  it('turns a limb amber once it has taken a hit, short of crippling', () => {
    const state = deriveBodyState({ left_arm: 1 }, [], 3);
    expect(state.left_arm.state).toBe('hurt');
    expect(state.left_arm.note).toBe('1/3 hits taken');
    expect(state.right_arm.state).toBe('clear');
  });

  it('ramps the ratio with the counter so a nearly-crippled limb looks worse', () => {
    expect(deriveBodyState({ left_leg: 1 }, [], 4).left_leg.ratio).toBeCloseTo(0.25);
    expect(deriveBodyState({ left_leg: 3 }, [], 4).left_leg.ratio).toBeCloseTo(0.75);
  });

  it('never ramps past full, even if a counter somehow overshoots', () => {
    expect(deriveBodyState({ left_leg: 9 }, [], 2).left_leg.ratio).toBe(1);
  });

  it('paints the exact limb a cripple names', () => {
    const state = deriveBodyState({}, [fx('crippled_arm', { part: 'left_arm' })], 2);
    expect(state.left_arm.state).toBe('crippled');
    expect(state.right_arm.state).toBe('clear');
  });

  it('falls back to a deterministic side for cripples saved before sides were recorded', () => {
    // Old instances carry no `part`. One crippled_arm must light exactly
    // one arm — never both, never neither.
    const state = deriveBodyState({}, [fx('crippled_arm')], 2);
    const crippled = ['left_arm', 'right_arm'].filter(k => state[k].state === 'crippled');
    expect(crippled).toEqual(['right_arm']);
  });

  it('claims one region per instance when two of the same cripple are active', () => {
    const state = deriveBodyState({}, [fx('crippled_leg'), fx('crippled_leg')], 2);
    expect(state.right_leg.state).toBe('crippled');
    expect(state.left_leg.state).toBe('crippled');
  });

  it('lets a sided instance take its own limb and the unsided one take the other', () => {
    const state = deriveBodyState({}, [fx('crippled_arm'), fx('crippled_arm', { part: 'left_arm' })], 2);
    expect(state.left_arm.state).toBe('crippled');
    expect(state.right_arm.state).toBe('crippled');
  });

  it('shows blindness on the eyes as a lasting injury', () => {
    expect(deriveBodyState({}, [fx('blinded')], 2).eyes.state).toBe('crippled');
  });

  it('keeps Stunned amber — it is a turn state, not something to treat', () => {
    expect(deriveBodyState({}, [fx('stunned')], 2).groin.state).toBe('hurt');
  });

  it('lets a cripple override a counter on the same limb', () => {
    const state = deriveBodyState({ left_leg: 1 }, [fx('crippled_leg', { part: 'left_leg' })], 3);
    expect(state.left_leg.state).toBe('crippled');
  });

  it('treats a missing or zero limb resistance as 1 rather than dividing by zero', () => {
    const state = deriveBodyState({ left_arm: 1 }, [], 0);
    expect(state.left_arm.resistance).toBe(1);
    expect(Number.isFinite(state.left_arm.ratio)).toBe(true);
  });

  it('survives junk input without throwing', () => {
    expect(() => deriveBodyState(undefined, undefined, undefined)).not.toThrow();
    expect(() => deriveBodyState({}, [null, {}, { source_id: 'nonsense' }], 2)).not.toThrow();
  });
});

describe('renderBodyWireframe', () => {
  it('draws one path per region', () => {
    const svg = renderBodyWireframe(deriveBodyState({}, [], 2));
    WIREFRAME_REGIONS.forEach(r => expect(svg).toContain(r.d));
  });

  it('is read-only unless given a click handler', () => {
    expect(renderBodyWireframe(deriveBodyState({}, [], 2))).not.toContain('onclick');
    const clickable = renderBodyWireframe(deriveBodyState({}, [], 2), { onClickFor: k => `pick('${k}')` });
    expect(clickable).toContain(`onclick="pick('left_arm')"`);
  });

  it('uses the crippled stroke for a crippled limb', () => {
    const svg = renderBodyWireframe(deriveBodyState({}, [fx('crippled_arm', { part: 'left_arm' })], 2));
    expect(svg).toContain(WIREFRAME_STATES.crippled.stroke);
  });

  it('outlines only the selected part', () => {
    const svg = renderBodyWireframe(deriveBodyState({}, [], 2), { selected: 'head' });
    expect((svg.match(/stroke-width="2.4"/g) || []).length).toBe(1);
  });

  it('puts the part name, its aim penalty and its condition in the tooltip', () => {
    const svg = renderBodyWireframe(deriveBodyState({ left_arm: 1 }, [], 2));
    expect(svg).toContain('<title>Left Arm (−20%) — 1/2 hits taken</title>');
  });

  it('appends a caller-supplied label, which the combat picker uses for hit chance', () => {
    const svg = renderBodyWireframe(deriveBodyState({}, [], 2), { labelFor: k => (k === 'head' ? '35%' : '') });
    expect(svg).toContain('Head (−20%) — ×1.5 damage on a hit — 35%');
  });

  it('keeps filter ids unique so two wireframes on one screen do not collide', () => {
    expect(renderBodyWireframe(deriveBodyState({}, [], 2), { idPrefix: 'a' })).toContain('id="a-glow"');
    expect(renderBodyWireframe(deriveBodyState({}, [], 2), { idPrefix: 'b' })).toContain('id="b-glow"');
  });
});
