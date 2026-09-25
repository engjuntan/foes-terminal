// The VATS-style body wireframe: one stroked humanoid that colours each
// body part by how hurt it is. Fallout's own targeting overlay is the
// reference — dim outline for a healthy part, amber as damage builds,
// red once it's actually crippled.
//
// This module deliberately owns no state of its own. Everything it draws
// is derived from data the app already keeps:
//   - `char.limb_damage`  — the per-limb hit counters (controllers.js)
//   - `limbResistance`    — max(1, floor(EN/2)) from deriveCharacter
//   - `char.status_effects` — where an actual cripple lives once a limb
//                             passes its resistance
// so the wireframe is a second *view* of the LIMBS rows on the Status
// tab, never a parallel source of truth that could disagree with them.
//
// It's hand-authored SVG rather than an image so it inherits --pip-green,
// scales to any tab width, and can be made clickable for aimed shots
// without a second asset or a hit-map.
import { BODY_PARTS } from './combat.js';

// Everything is drawn in this box; callers size the <svg> however they
// like and the paths scale with it.
export const WIREFRAME_VIEWBOX = '0 0 100 160';

// The figure FACES THE VIEWER, exactly like a VATS target does. So the
// part keyed `left_arm` — the target's own left arm — is drawn on the
// viewer's RIGHT. Getting this backwards is the classic body-map bug,
// hence the note here and the mirrored x-coordinates below.
export const WIREFRAME_REGIONS = [
  { key: 'head',      d: 'M50 4 C57 4 62 9 62 16 C62 25 57 31 50 31 C43 31 38 25 38 16 C38 9 43 4 50 4 Z' },
  { key: 'eyes',      d: 'M41 14 L59 14 L59 19.5 L41 19.5 Z' },
  { key: 'torso',     d: 'M38 34 L62 34 L66 47 L64 75 L36 75 L34 47 Z' },
  { key: 'right_arm', d: 'M33 36 L24 41 L19 70 L17 96 L25 98 L28 70 L34 49 Z' },
  { key: 'left_arm',  d: 'M67 36 L76 41 L81 70 L83 96 L75 98 L72 70 L66 49 Z' },
  { key: 'groin',     d: 'M37 77 L63 77 L61 89 L39 89 Z' },
  { key: 'right_leg', d: 'M39 91 L49 91 L48 122 L46 154 L37 154 L37 122 Z' },
  { key: 'left_leg',  d: 'M51 91 L61 91 L63 122 L63 154 L54 154 L52 122 Z' }
];

// Drawn last so they read as detail on top of the body, not as regions
// competing with it. Purely decorative — no part key, never clickable.
const WIREFRAME_DETAIL = [
  'M34 47 L66 47',          // chest line
  'M50 34 L50 75',          // sternum
  'M44 31 L44 34 M56 31 L56 34' // neck
];

export const WIREFRAME_STATES = {
  clear:    { stroke: 'var(--pip-dim)', fill: 'rgba(51,255,51,0.05)', label: 'OK' },
  hurt:     { stroke: '#ffb000',        fill: 'rgba(255,176,0,0.12)', label: 'HURT' },
  crippled: { stroke: '#ff3b30',        fill: 'rgba(255,59,48,0.28)', label: 'CRIPPLED' }
};

// --- STATE ---------------------------------------------------------
// One pass over the same two fields the LIMBS rows read, producing a
// `{ state, count, resistance, note }` for every region.
//
// Which arm is crippled: the cripple status effect was originally
// generic to "an arm" (STATUS_AND_CRIPPLE_SPEC B.4, "tracking is
// positional, consequence is not"), so older saved instances carry no
// side at all. Newer ones record `part` at the moment they're granted.
// Honour `part` when it's there; otherwise fall back to the same
// left-before-right pooling buildLimbRows() already uses, so the
// wireframe and the rows can never contradict each other.
export function deriveBodyState(limbDamage = {}, statusEffects = [], limbResistance = 1) {
  const resistance = Math.max(1, limbResistance || 1);
  const effects = Array.isArray(statusEffects) ? statusEffects : [];

  const sided = {};          // part key -> effect that named this exact part
  const unsidedByEffect = {}; // effectId -> effects with no part recorded
  effects.forEach(fx => {
    if (!fx || !fx.source_id) return;
    if (fx.part && BODY_PARTS[fx.part]) { sided[fx.part] = fx; return; }
    (unsidedByEffect[fx.source_id] = unsidedByEffect[fx.source_id] || []).push(fx);
  });

  const out = {};
  WIREFRAME_REGIONS.forEach(({ key }) => {
    const part = BODY_PARTS[key] || {};
    const count = limbDamage[key] || 0;
    let afflicted = sided[key] || null;

    // An unsided instance is claimed by the first region that could own
    // it, in WIREFRAME_REGIONS order (right arm before left, right leg
    // before left) — deterministic, and it never claims more regions
    // than there are actual instances.
    if (!afflicted && part.effectId) {
      const pool = unsidedByEffect[part.effectId];
      if (pool && pool.length) afflicted = pool.shift();
    }

    let state = 'clear';
    let note = 'No damage';
    if (afflicted) {
      // Stunned is a turn-based state that happens to hang off the groin,
      // not a lasting injury — amber, not red, so it can't be mistaken
      // for something that needs a Doctor's Bag.
      const lasting = /^crippled_/.test(afflicted.source_id) || afflicted.source_id === 'blinded';
      state = lasting ? 'crippled' : 'hurt';
      note = afflicted.name || afflicted.source_id;
    } else if (part.crippleCounter && count > 0) {
      state = 'hurt';
      note = `${count}/${resistance} hits taken`;
    } else if (!part.crippleCounter && !part.effectId) {
      // Head and torso carry no persisting injury (head/torso cripples
      // are still in the parking lot), so they're drawn and targetable
      // but nothing can currently light them up. The head's damage
      // multiplier is the one thing worth saying about it here, since
      // this tooltip is also what the aimed-shot picker shows.
      note = part.damageMultiplier ? `×${part.damageMultiplier} damage on a hit` : 'No lasting injury';
    }

    out[key] = {
      state,
      note,
      count,
      resistance: part.crippleCounter ? resistance : null,
      // How far this limb is toward crippling, for the amber ramp.
      ratio: part.crippleCounter ? Math.min(1, count / resistance) : (state === 'clear' ? 0 : 1)
    };
  });
  return out;
}

// --- DRAWING -------------------------------------------------------
// `opts`:
//   selected    — part key to outline as the current aim point
//   onClickFor  — key => a JS expression string for an inline onclick;
//                 omit it for a read-only diagram
//   labelFor    — key => extra text appended to the hover tooltip
//                 (the combat picker uses it for per-part hit chance)
//   idPrefix    — keeps gradient/filter ids unique if two are on screen
export function renderBodyWireframe(state, opts = {}) {
  const { selected, onClickFor, labelFor, idPrefix = 'wf' } = opts;
  const glowId = `${idPrefix}-glow`;

  const regions = WIREFRAME_REGIONS.map(({ key, d }) => {
    const info = state[key] || { state: 'clear', note: '' };
    const look = WIREFRAME_STATES[info.state] || WIREFRAME_STATES.clear;
    const part = BODY_PARTS[key] || { label: key };
    const isSelected = selected === key;

    // The amber ramp: a limb one hit from crippling should already look
    // alarming, so the fill opacity tracks the counter rather than
    // flipping on at the first scratch.
    const fill = info.state === 'hurt' && info.resistance
      ? `rgba(255,176,0,${(0.08 + 0.3 * (info.ratio || 0)).toFixed(3)})`
      : look.fill;

    const extra = labelFor ? labelFor(key) : '';
    const tip = `${part.label}${part.penalty ? ` (−${part.penalty}%)` : ''} — ${info.note}${extra ? ` — ${extra}` : ''}`;
    const click = onClickFor ? ` onclick="${onClickFor(key)}" style="cursor:pointer;"` : '';

    return `<path d="${d}" fill="${fill}" stroke="${isSelected ? 'var(--pip-green)' : look.stroke}" stroke-width="${isSelected ? 2.4 : 1.2}" stroke-linejoin="round"${click}><title>${tip}</title></path>`;
  }).join('');

  const detail = WIREFRAME_DETAIL
    .map(d => `<path d="${d}" fill="none" stroke="var(--pip-dim)" stroke-width="0.6" opacity="0.5"/>`)
    .join('');

  return `
    <svg viewBox="${WIREFRAME_VIEWBOX}" preserveAspectRatio="xMidYMid meet" style="width:100%; height:100%; display:block; filter:url(#${glowId});" role="img" aria-label="Body condition">
      <defs>
        <filter id="${glowId}" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.7" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      ${regions}
      ${detail}
    </svg>`;
}
