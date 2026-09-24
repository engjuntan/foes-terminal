// src/views.js
import { calculateDerivedStats, deriveCharacter, RACE_RULES, getRadiationTier, RAD_THRESHOLDS, CARRY_OVERAGE_ALLOWANCE } from './formulas.js';
import { getItem, itemDatabase } from './items.js';
import { normalizeInventory, getInventoryQuantity } from './inventory.js';
import { SPECIAL_INFO, SPECIAL_ORDER, SPECIAL_FLAVOR, SKILL_INFO } from './goatContent.js';

// Every skill, grouped the way the dashboard shows them. Character
// creation's tag picker reads this too, so a new skill only needs adding
// here (plus its formula and SKILL_INFO line).
const SKILL_CATEGORIES = {
  "COMBAT SKILLS": ["small_guns", "big_guns", "energy_weapons", "melee_weapons", "throwing", "unarmed"],
  "COVERT SKILLS": ["sneak", "steal", "lockpick", "traps"],
  "SCIENCE SKILLS": ["medicine", "science", "engineering", "robotics", "gunsmith", "repair"],
  "SOFT SKILLS": ["speech", "survival", "instinct"]
};
import { DIFFICULTY_TIERS } from './checks.js';
import { getTrait, traitDatabase } from './traits.js';
import { statusEffectDatabase } from './statusEffects.js';
import { bestiaryDatabase } from './bestiary.js';
import { BODY_PARTS, BURST_HIT_PENALTY, STANCES, COVER_LEVELS, DAMAGE_TYPE_LABELS, isMonsterAttackMelee, effectiveTargetAC } from './combat.js';
import { dataLogDatabase } from './dataLogs.js';
import { peopleDatabase } from './people.js';
import { questDatabase } from './quests.js';
import { glossaryDatabase } from './glossary.js';
import { mapDatabase } from './maps.js';
import { normalizeNeeds, getNeedTier, formatGameTime, NEED_RATES } from './needs.js';
import { visibleEventLog } from './eventLog.js';
import {
  REPUTATION_TIERS, REPUTATION_MIN, REPUTATION_MAX, KARMA_TIERS, KARMA_MIN, KARMA_MAX,
  getReputationTier, getReputationModifiers, getKarmaTier, getKarmaValue,
  normalizeReputationEntities
} from './reputationContent.js';
import { STATIONS, canCraft, netWeightDelta } from './crafting.js';
import { recipeDatabase } from './recipes.js';
import {
  isDurable, isBroken, normalizeCondition, conditionLabel, scrapYieldFor,
  repairFloor, repairSaveChance, totalRepairCost, genericScrapComponent
} from './condition.js';

// --- HELPERS ---
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Durability system: a small 5-dot meter (each dot = 2 marks) plus a
// text label, e.g. "●●●○○ Worn (6/10)" — the brief's own suggested
// format. Shared by every gear/inventory listing that shows a durable
// item's condition, GM controls included.
function conditionMeter(marks) {
  const m = Math.max(0, Math.min(10, marks || 0));
  const filled = Math.round(m / 2);
  const dots = '●'.repeat(filled) + '○'.repeat(5 - filled);
  const broken = m >= 10;
  const color = m === 0 ? 'var(--pip-green)' : broken ? 'var(--danger, #d4574a)' : m >= 7 ? 'orange' : 'var(--pip-dim)';
  return `<span style="color:${color}; font-size:11px; white-space:nowrap;" title="${conditionLabel(m)} (${m}/10)">${dots} ${conditionLabel(m)} (${m}/10)${broken ? ' — BROKEN' : ''}</span>`;
}

// used/capacity gauge for the carry-weight system — green under
// capacity, yellow in the GM's 10% grace zone (allowed, no penalty,
// just a warning), red at/over the hard-block line (acquiring more
// gets refused there, see CARRY_OVERAGE_ALLOWANCE).
function renderCarryWeightGauge(used, capacity) {
  const hardLimit = capacity * CARRY_OVERAGE_ALLOWANCE;
  const pct = capacity > 0 ? Math.min(100, (used / capacity) * 100) : 0;
  let color = 'var(--pip-green)';
  if (used > capacity) color = 'yellow';
  if (used >= hardLimit) color = 'red';
  return `
    <div style="margin-bottom:20px;">
      <label>CARRY WEIGHT</label>
      <div style="background:#222; height:14px; border:1px solid ${color}; margin-top:5px;"><div style="width:${pct}%; background:${color}; height:100%;"></div></div>
      <div style="text-align:right; font-size:12px; color:${color};">${used.toFixed(1)} / ${capacity.toFixed(1)} kg</div>
    </div>`;
}

// Same gauge idiom as carry weight, generalized for the three needs —
// green full, sliding to red as it EMPTIES (100 -> 0). Radiation uses the
// same visual language but in reverse (fills as it worsens, see
// renderRadiationGauge below) so all four sit together as one legible row.
function renderNeedGauge(label, value, tier) {
  let color = 'var(--pip-green)';
  if (value <= 60) color = 'yellow';
  if (value <= 40) color = 'orange';
  if (value <= 20) color = 'red';
  const penaltyText = Object.entries(tier.modifiers || {})
    .filter(([k]) => k.startsWith('special_'))
    .map(([k, v]) => `${k.replace('special_', '').toUpperCase()} ${v}`)
    .join(' ');
  return `
    <div style="margin-bottom:12px;">
      <div style="display:flex; justify-content:space-between; font-size:11px;">
        <label>${label}</label>
        <span style="color:${color};">${Math.round(value)} — ${tier.label}${penaltyText ? ` (${penaltyText})` : ''}</span>
      </div>
      <div style="background:#222; height:10px; border:1px solid ${color}; margin-top:3px;"><div style="width:${value}%; background:${color}; height:100%;"></div></div>
    </div>`;
}

// Radiation's own gauge, pulled out of getPlayerView so it sits in the
// same VITALS block as the three need gauges above — visually identical
// row, but FILLS as it worsens (0 rads = empty/safe) instead of emptying.
function renderRadiationGauge(rads) {
  const radTierIndex = RAD_THRESHOLDS.findIndex(t => t.rads === getRadiationTier(rads).rads);
  const radPercent = (radTierIndex / (RAD_THRESHOLDS.length - 1)) * 100; // tier-based, not exact rads — stays vague
  let color = "yellow";
  if (rads > 400) color = "orange";
  if (rads > 800) color = "red";
  if (rads === 0) color = "var(--pip-green)";
  return `
    <div style="margin-bottom:12px;">
      <div style="display:flex; justify-content:space-between; font-size:11px;">
        <label>RADIATION</label>
        <span style="color:${color}; font-style:italic;">${getRadiationTier(rads).description}</span>
      </div>
      <div style="background:#222; height:10px; border:1px solid ${color}; margin-top:3px;"><div style="width:${radPercent}%; background:${color}; height:100%;"></div></div>
    </div>`;
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// --- STATUS (STATUS_AND_CRIPPLE_SPEC.md Part A/C) ---
// Human-readable labels for the non-SPECIAL, non-skill modifier keys
// that show up in `derived.breakdown.other` and in status/need/radiation
// tier `modifiers` objects — shared by the CONDITION block (dashboard +
// STATUS tab) and the PASSIVE block (STATUS tab).
const MODIFIER_KEY_LABELS = {
  ac_bonus: 'Armor Class', sequence_bonus: 'Sequence', melee_dmg_flat: 'Melee Damage',
  carry_bonus: 'Carry Capacity', healing_rate_bonus: 'Healing Rate', max_hp_flat: 'Max HP',
  damage_res: 'Damage Resistance', hit_chance_pct: 'Hit Chance', skip_turn: 'Skip Turn',
  damage_per_turn: 'Damage/Turn'
};
function modifierKeyLabel(key) {
  if (MODIFIER_KEY_LABELS[key]) return MODIFIER_KEY_LABELS[key];
  if (key.startsWith('special_')) return key.replace('special_', '').toUpperCase();
  if (key.startsWith('skill_')) return key.replace('skill_', '').replace(/_/g, ' ').toUpperCase();
  return key.replace(/_/g, ' ');
}
// Renders a modifiers object ({special_per:-2, ...}) as "-2 PER  -1 AGI"
// for a single condition row. Non-numeric entries (skip_turn: true) show
// their label alone, since there's no magnitude to sign.
function formatModifierList(modifiers) {
  return Object.entries(modifiers || {})
    .map(([k, v]) => typeof v === 'number' ? `${v > 0 ? '+' : ''}${v} ${modifierKeyLabel(k)}` : modifierKeyLabel(k))
    .join('  ');
}

// One source of truth for "what's active or approaching" — used by both
// the dashboard's always-visible compact CONDITION block and the full
// STATUS tab, so the two can never drift apart (GM ruling, 2026-09-22:
// statuses belong on the dashboard, not just behind a tab).
// Radiation deliberately never carries the exact rads number here — the
// player-facing views never show it (see renderRadiationGauge); only the
// GM's own screens do.
function buildConditionRows(charData) {
  const rows = [];

  (charData.status_effects || []).forEach(fx => {
    const hasEffect = Object.keys(fx.modifiers || {}).length > 0;
    rows.push({
      active: hasEffect,
      label: fx.name,
      detail: fx.duration_turns ? `${fx.duration_turns} turn(s) left` : 'until cured',
      mods: hasEffect ? formatModifierList(fx.modifiers) : 'no numeric effect'
    });
  });

  const needs = normalizeNeeds(charData.needs);
  [['hunger', 'Hunger'], ['thirst', 'Thirst'], ['sleep', 'Sleep']].forEach(([key, label]) => {
    const tier = getNeedTier(key, needs[key]);
    const hasEffect = Object.keys(tier.modifiers || {}).length > 0;
    if (!hasEffect && tier.at === 100) return; // fully sated/hydrated/rested — nothing to show
    rows.push({
      active: hasEffect,
      label: tier.label,
      detail: `${label.toLowerCase()} ${Math.round(needs[key])}/100`,
      mods: hasEffect ? formatModifierList(tier.modifiers) : 'no effect yet'
    });
  });

  const rads = charData.rads || 0;
  if (rads > 0) {
    const radTier = getRadiationTier(rads);
    const hasEffect = Object.keys(radTier.modifiers || {}).length > 0;
    rows.push({
      active: hasEffect,
      label: hasEffect ? 'Radiation Sickness' : 'Radiation (trace)',
      detail: radTier.description,
      mods: hasEffect ? formatModifierList(radTier.modifiers) : 'no effect yet'
    });
  }

  return rows;
}

// Same row shape, two densities: the dashboard gets this exact markup
// (small, single-line-ish); the STATUS tab reuses it verbatim under its
// own CONDITION heading, per C.1/C.2.
function renderConditionRows(rows) {
  if (rows.length === 0) return `<div style="color:#555; font-size:12px; padding:4px 0;">No active or approaching conditions.</div>`;
  return rows.map(r => `
    <div style="display:flex; justify-content:space-between; align-items:baseline; gap:10px; font-size:12px; padding:4px 0; border-bottom:1px dashed #222; opacity:${r.active ? 1 : 0.55};">
      <span style="color:${r.active ? 'var(--danger, #ff5555)' : '#888'}; flex-shrink:0;">${r.active ? '●' : '○'} ${escapeHtml(r.label)}</span>
      <span style="color:#888; text-align:center; flex-grow:1;">${escapeHtml(r.detail)}</span>
      <span style="color:${r.active ? 'var(--danger, #ff5555)' : '#666'}; text-align:right; flex-shrink:0;">${escapeHtml(r.mods)}</span>
    </div>`).join('');
}

// LIMBS (STATUS_AND_CRIPPLE_SPEC.md Part B/C.2): only the arm/leg body
// parts carry a persistent hit counter — combat.js's `crippleCounter`
// flag on BODY_PARTS marks exactly these four, since eyes/groin stay
// instant-on-hit and out of this system (see that flag's own comment).
// The status effect itself (crippled_arm/crippled_leg) is generic to
// "an arm"/"a leg", not a specific left/right key (B.4's "tracking is
// positional, consequence is not") — active instances are handed to
// matching rows in a fixed left-before-right order, so at most as many
// rows show CRIPPLED as there are actual instances.
const LIMB_PART_KEYS = Object.keys(BODY_PARTS).filter(k => BODY_PARTS[k].crippleCounter);
function buildLimbRows(charData, derived) {
  const limbDamage = charData.limb_damage || {};
  const poolByEffect = {};
  (charData.status_effects || []).forEach(fx => {
    if (!poolByEffect[fx.source_id]) poolByEffect[fx.source_id] = [];
    poolByEffect[fx.source_id].push(fx);
  });
  const rows = [];
  LIMB_PART_KEYS.forEach(partKey => {
    const bodyPart = BODY_PARTS[partKey];
    const count = limbDamage[partKey] || 0;
    const pool = poolByEffect[bodyPart.effectId] || [];
    const crippleFx = pool.length > 0 ? pool.shift() : null;
    if (count === 0 && !crippleFx) return; // C.2: only parts with hits or a cripple appear
    rows.push({ partKey, label: bodyPart.label, count, resistance: derived.limbResistance || 1, crippleFx });
  });
  return rows;
}
// Reuses renderNeedGauge (C.2's own instruction) rather than inventing a
// second bar idiom — the gauge shows remaining "limb health"
// (resistance - hits taken), same drains-toward-red-as-it-worsens
// language as HP/needs, bottoming out at 0/red once actually crippled.
function renderLimbRows(rows, charId) {
  if (rows.length === 0) return `<div style="color:#555; font-size:12px; padding:4px 0;">No limb damage — nothing to treat.</div>`;
  return rows.map(r => {
    const value = r.crippleFx ? 0 : Math.max(0, Math.round(((r.resistance - r.count) / r.resistance) * 100));
    const tier = { label: r.crippleFx ? 'CRIPPLED' : `${r.count}/${r.resistance} hits taken`, modifiers: {} };
    return `
      ${renderNeedGauge(r.label.toUpperCase(), value, tier)}
      <div style="margin:-6px 0 10px; text-align:right;">
        <span onclick="window.openTreatLimbDraft('${charId}', '${r.partKey}')" style="cursor:pointer; font-size:11px; text-decoration:underline; color:var(--pip-dim);">[ TREAT ]</span>
      </div>`;
  }).join('');
}
// B.6's two routes, drawn inline under LIMBS when a TREAT link is
// clicked (window.treatLimbDraft, set by openTreatLimbDraft). Kept to
// self-treatment only for now (healer === target === the viewer) — the
// controllers underneath (treatLimbWithDoctorsBag/treatLimbWithMedicine)
// already take independent healer/target ids for a teammate treating
// someone else, but exposing that needs a target-picker UI this tab
// doesn't have yet (see this agent's report).
function renderTreatLimbForm(charData, charId) {
  const draft = window.treatLimbDraft;
  if (!draft || draft.targetCharId !== charId) return '';
  const bodyPart = BODY_PARTS[draft.partKey];
  if (!bodyPart) return '';
  const hasBag = getInventoryQuantity(charData.inventory, 'doctors_bag') > 0;
  return `
    <div style="border:1px solid var(--pip-dim); padding:8px; margin:6px 0 14px; background:rgba(0,20,0,0.3);">
      <div style="font-size:12px; margin-bottom:6px;">Treating <strong>${escapeHtml(bodyPart.label)}</strong></div>
      <div style="display:flex; gap:6px; margin-bottom:6px;">
        <select onchange="window.setTreatLimbField('method', this.value)" style="flex-grow:1; background:black; color:var(--pip-green); border:1px solid var(--pip-dim); font-family:'VT323';">
          <option value="medicine" ${draft.method === 'medicine' ? 'selected' : ''}>Medicine check (DC 20)</option>
          <option value="doctors_bag" ${draft.method === 'doctors_bag' ? 'selected' : ''} ${hasBag ? '' : 'disabled'}>Doctor's Bag${hasBag ? '' : ' (none owned)'}</option>
        </select>
      </div>
      ${draft.method === 'medicine' ? `
      <div style="display:flex; gap:6px; margin-bottom:6px;">
        <input type="number" min="1" max="100" value="${draft.roll}" placeholder="ROLL 1-100"
               oninput="window.setTreatLimbField('roll', this.value)"
               style="flex-grow:1; background:black; color:var(--pip-green); border:1px solid var(--pip-dim); font-family:'VT323';">
        <button class="gm-btn" onclick="window.rollForTreatLimb()">ROLL</button>
      </div>` : ''}
      <div style="display:flex; gap:6px;">
        <button class="gm-btn" style="border-color:var(--pip-green); color:var(--pip-green);" onclick="window.resolveTreatLimbDraft()">CONFIRM</button>
        <button class="gm-btn" onclick="window.cancelTreatLimbDraft()">CANCEL</button>
      </div>
    </div>`;
}

// Full STATUS tab (STATUS_AND_CRIPPLE_SPEC.md Part C): CONDITION (same
// rows as the dashboard's compact block), LIMBS (per-limb hit counters
// and cripples, C.2/Part B), ATTRIBUTES (full provenance — every
// modifier with its source, per A.2/C.2), PASSIVE (things helping, not
// hurting).
export function getStatusView(charId, liveData) {
  const charData = liveData.characters[charId];
  if (!charData) return `<h1>&gt; ERROR: IDENTITY NOT FOUND</h1>`;
  const derived = deriveCharacter(charData);
  const breakdown = derived.breakdown || { baseSpecial: {}, skillsBase: {}, special: {}, skills: {}, other: [] };

  const conditionRows = buildConditionRows(charData);
  const limbRows = buildLimbRows(charData, derived);

  // ATTRIBUTES — SPECIAL stats first (only ones with at least one
  // modifier, per C.2's "a clean character should see a short screen"
  // rule), then skills. Skill "base" folds in skill_ranks + the +20 tag
  // bonus (deriveCharacter's own additions, not a modifier source) so
  // the displayed arrow reconciles against the rows shown underneath it.
  const attrRows = [];
  SPECIAL_ORDER.forEach(stat => {
    const mods = breakdown.special[stat];
    if (!mods || mods.length === 0) return;
    attrRows.push({
      label: stat.toUpperCase(),
      base: breakdown.baseSpecial[stat],
      final: derived.special[stat],
      mods
    });
  });
  Object.keys(derived.skills).forEach(skillName => {
    const mods = breakdown.skills[skillName];
    if (!mods || mods.length === 0) return;
    const rankBonus = (charData.skill_ranks?.[skillName] || 0) + (charData.tags?.[skillName] ? 20 : 0);
    attrRows.push({
      label: skillName.replace(/_/g, ' ').toUpperCase(),
      base: (breakdown.skillsBase[skillName] || 0) + rankBonus,
      final: derived.skills[skillName],
      mods
    });
  });

  const attributesHtml = attrRows.length === 0
    ? `<div style="color:#555; font-size:12px;">Nothing modified — every attribute and skill is at its clean value.</div>`
    : attrRows.map(row => `
      <div style="margin-bottom:10px;">
        <div style="display:flex; justify-content:space-between; font-size:14px;">
          <strong>${row.label}</strong>
          <span>${row.base} → <span style="color:${row.final < row.base ? 'var(--danger, #ff5555)' : 'var(--pip-green)'};">${row.final}</span></span>
        </div>
        ${row.mods.map(m => `
          <div style="display:flex; justify-content:space-between; font-size:11px; color:${m.value < 0 ? 'var(--danger, #ff5555)' : 'var(--pip-green)'}; padding-left:10px;">
            <span>${m.value > 0 ? '+' : ''}${m.value} ${escapeHtml(m.source)}</span>
            <span style="color:#666;">${m.sourceType || ''}</span>
          </div>`).join('')}
      </div>`).join('');

  // PASSIVE — trait/perk/equipment/race sources only. Radiation/need
  // sources land in `other` too (max_hp_flat) but they're already
  // surfaced above in CONDITION — repeating them here would be the same
  // penalty twice under two different headings.
  const passiveRows = (breakdown.other || []).filter(r => ['trait', 'perk', 'equipment', 'race'].includes(r.sourceType));

  const passiveHtml = passiveRows.length === 0
    ? `<div style="color:#555; font-size:12px;">Nothing passive active.</div>`
    : passiveRows.map(r => `
      <div style="display:flex; justify-content:space-between; font-size:13px; padding:3px 0; border-bottom:1px dashed #222;">
        <span style="color:${r.value < 0 ? 'var(--danger, #ff5555)' : 'var(--pip-green)'};">${r.value > 0 ? '+' : ''}${r.value} ${modifierKeyLabel(r.key)}</span>
        <span style="color:#888;">${escapeHtml(r.source)} <span style="color:#555;">(${r.sourceType})</span></span>
      </div>`).join('');

  return `
    <div class="dashboard-container" style="grid-template-columns: minmax(240px, 1fr) minmax(240px, 1fr); max-width:900px; margin:0 auto;">
      <div class="panel">
        <h2 style="color:var(--pip-dim);">CONDITION</h2>
        ${renderConditionRows(conditionRows)}
        <h2 style="color:var(--pip-dim); margin-top:20px;">LIMBS</h2>
        ${renderLimbRows(limbRows, charId)}
        ${renderTreatLimbForm(charData, charId)}
      </div>
      <div class="panel">
        <h2 style="color:var(--pip-dim);">ATTRIBUTES</h2>
        <div style="margin-bottom:20px;">${attributesHtml}</div>
        <h2 style="color:var(--pip-dim);">PASSIVE</h2>
        ${passiveHtml}
      </div>
    </div>
  `;
}

// --- REPUTATION (Fallout 2-style: named tiers only, never raw numbers —
// the exact slider value is GM-only, same convention as radiation's
// "only a Geiger Counter tells you the real count") ---
// One small square art slot per tier/card, per SCOPE_DECISIONS.md —
// shows a tasteful empty frame with the tier name until the GM supplies
// image_url, same fallback used for the G.O.A.T. focus-stat card above.
function reputationArtFrame(imageUrl, label) {
  return imageUrl
    ? `<img src="${imageUrl}" style="width:100%; height:100%; object-fit:cover; display:block;">`
    : `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; text-align:center; color:#444; font-size:11px; padding:4px; box-sizing:border-box;">[ ART PENDING — ${escapeHtml(label)} ]</div>`;
}

export function getReputationView(charId, liveData) {
  const char = liveData.characters[charId];
  if (!char) return `<h1>&gt; ERROR: IDENTITY NOT FOUND</h1>`;

  const karmaValue = getKarmaValue(char);
  const karmaTier = getKarmaTier(karmaValue);

  const entities = normalizeReputationEntities(liveData.reputation_entities);
  const entityCardsHtml = entities.map(entity => {
    const { tier } = getReputationModifiers(entity.id, liveData);
    return `
      <div style="display:flex; gap:10px; border:1px solid var(--pip-dim); background:rgba(0,20,0,0.3); padding:10px; margin-bottom:10px;">
        <div style="width:80px; height:80px; flex-shrink:0; border:1px solid var(--pip-dim); overflow:hidden;">
          ${reputationArtFrame(tier.image_url, tier.name)}
        </div>
        <div style="flex-grow:1; min-width:0;">
          <div style="display:flex; justify-content:space-between; align-items:baseline; flex-wrap:wrap; gap:6px;">
            <strong style="color:var(--pip-green);">${escapeHtml(entity.name)}</strong>
            <span style="color:var(--pip-gold); font-size:12px; text-transform:uppercase; letter-spacing:1px;">${escapeHtml(tier.name)}</span>
          </div>
          <div style="font-size:13px; color:#ccc; margin:6px 0; line-height:1.4;">${escapeHtml(tier.description)}</div>
          <div style="font-size:12px; color:var(--pip-dim); border-top:1px dashed #333; padding-top:5px;">${escapeHtml(tier.effect)}</div>
        </div>
      </div>`;
  }).join('') || `<div style="color:#555; font-size:12px;">No known factions tracked yet.</div>`;

  return `
    <div class="dashboard-container" style="display:block; max-width:700px; margin:0 auto; padding-top:10px;">
      <div class="panel" style="height:auto; margin-bottom:16px;">
        <h2 style="color:var(--pip-dim);">KARMA</h2>
        <div style="display:flex; gap:14px; align-items:center;">
          <div style="width:80px; height:80px; flex-shrink:0; border:1px solid var(--pip-dim); overflow:hidden;">
            ${reputationArtFrame(karmaTier.image_url, karmaTier.name)}
          </div>
          <div>
            <div style="color:var(--pip-gold); font-size:18px; text-transform:uppercase; letter-spacing:1px;">${escapeHtml(karmaTier.name)}</div>
            <div style="font-size:13px; color:#ccc; margin-top:4px; line-height:1.4;">${escapeHtml(karmaTier.description)}</div>
          </div>
        </div>
      </div>

      <div class="panel" style="height:auto;">
        <h2 style="color:var(--pip-dim);">REPUTATION</h2>
        <p style="font-size:11px; color:#666; margin:-6px 0 10px;">How each faction and town actually treats you. The exact standing is known only to the GM — this is what it looks like from where you're standing.</p>
        ${entityCardsHtml}
      </div>
    </div>
  `;
}

// Wraps any glossary term found in already-escaped HTML with the
// app's existing hover/tap tooltip (renderWikiLink — same mechanism
// already used for SPECIAL stats, skills, traits, and item names), so
// Data Log / Quest bodies can surface quick definitions pulled from
// the wiki. Longest-name-first in the alternation so e.g. "The
// Federation" (if authored) wins over a bare "Federation" at the same
// starting position — standard regex alternation already prefers the
// earlier/longer branch when several match at once, so no extra
// overlap-resolution logic is needed. Must run AFTER escapeHtml(),
// never before — matching happens on the final markup, and the
// matched (already-safe) text is what gets handed to renderWikiLink
// as the visible name, so nothing unescaped ever gets inserted.
// Every term contributes its name AND its aliases as matchable phrases
// (see extractAliases in sync-obsidian.js — formal filenames like
// "Federation of Malaya" almost never appear in real prose, "Federation"
// does). Phrases are sorted longest-first so "Federation of Malaya" still
// wins over a bare "Federation" alias at the same starting position.
//
// Priority when two terms claim the same phrase: a term's own NAME always
// beats another term's alias (PosLaju lists "Riders" as an alias, but
// "Riders" is also a term in its own right — it should mean Riders).
// Built in two passes so that holds regardless of object order.
//
// strict_aliases are auto-derived ("Chosen" from "Chosen (Federation)")
// and are common words, so they only link on an exact-case match.
let glossaryPattern = null;
function getGlossaryPattern() {
  if (glossaryPattern) return glossaryPattern;
  const phraseToEntry = new Map(); // lowercase phrase -> { term, original, strict }
  const terms = Object.values(glossaryDatabase);
  terms.forEach(term => {
    phraseToEntry.set(term.name.toLowerCase(), { term, original: term.name, strict: false });
  });
  terms.forEach(term => {
    (term.aliases || []).forEach(a => {
      const key = a.toLowerCase();
      if (!phraseToEntry.has(key)) phraseToEntry.set(key, { term, original: a, strict: false });
    });
    (term.strict_aliases || []).forEach(a => {
      const key = a.toLowerCase();
      if (!phraseToEntry.has(key)) phraseToEntry.set(key, { term, original: a, strict: true });
    });
  });
  if (phraseToEntry.size === 0) return null;
  const phrases = [...phraseToEntry.keys()].sort((a, b) => b.length - a.length);
  const alternation = phrases.map(escapeRegex).join('|');
  glossaryPattern = { regex: new RegExp(`\\b(${alternation})\\b`, 'gi'), phraseToEntry };
  return glossaryPattern;
}
// Only the FIRST mention of each term gets a tooltip, wiki-style. With
// short aliases in play, linking every occurrence turns a log that says
// "Federation" six times into a wall of underlines. Keyed by term id, so
// "Federation" early on and "Federation of Malaya" later still count as
// the same term and only the first one links.
// Safe against re-matching inserted markup: String.replace scans the
// original string only, never the tooltip HTML it inserts.
function applyGlossaryTooltips(safeHtml) {
  const pattern = getGlossaryPattern();
  if (!pattern) return safeHtml;
  const alreadyLinked = new Set();
  return safeHtml.replace(pattern.regex, (matchText) => {
    const entry = pattern.phraseToEntry.get(matchText.toLowerCase());
    if (!entry) return matchText;
    if (entry.strict && matchText !== entry.original) return matchText;
    if (alreadyLinked.has(entry.term.id)) return matchText;
    alreadyLinked.add(entry.term.id);
    return renderWikiLink(matchText, entry.term.summary);
  });
}

// Builds a nested tree from a flat list of entries carrying a
// category_path array (e.g. Data Logs, folder-derived).
function buildCategoryTree(entries) {
  const root = { children: {}, items: [] };
  entries.forEach(entry => {
    let node = root;
    (entry.category_path || []).forEach(segment => {
      if (!node.children[segment]) node.children[segment] = { children: {}, items: [] };
      node = node.children[segment];
    });
    node.items.push(entry);
  });
  return root;
}

function renderCategoryTree(node, renderItem, depth = 0) {
  let html = '';
  Object.entries(node.children).sort(([a], [b]) => a.localeCompare(b)).forEach(([name, child]) => {
    html += `<div style="margin-left:${depth * 16}px; margin-top:8px;">
      <div style="color:var(--pip-dim); font-weight:bold; text-transform:uppercase; font-size:13px; border-bottom:1px dashed var(--pip-dim); padding-bottom:2px;">${name}</div>
      ${renderCategoryTree(child, renderItem, depth + 1)}
    </div>`;
  });
  node.items.forEach(item => {
    html += `<div style="margin-left:${(depth + 1) * 16}px;">${renderItem(item)}</div>`;
  });
  return html;
}

// Builds a nested tree from a flat list of entries carrying a parent_id
// (e.g. Maps, since image files sit flat in one folder and can't derive
// hierarchy from their location the way Data Logs can).
function buildParentTree(entries) {
  const byId = {};
  entries.forEach(e => { byId[e.id] = { entry: e, children: [] }; });
  const roots = [];
  entries.forEach(e => {
    const node = byId[e.id];
    if (e.parent_id && byId[e.parent_id]) byId[e.parent_id].children.push(node);
    else roots.push(node);
  });
  return roots;
}

export function renderWikiLink(name, description) {
  if (!description) description = "No data available.";
  const safeDesc = description.replace(/"/g, "&quot;").replace(/'/g, "\\'");
  // One line, no whitespace around the name: this is dropped inline into
  // white-space:pre-wrap bodies (data logs, people, quests), where any
  // newline or indent in the markup renders as a real line break.
  return `<span class="wiki-link" onmouseover="window.showTooltip('${safeDesc}', event)" onmouseout="window.hideTooltip()" onclick="window.toggleTooltip('${safeDesc}', event)">${name}</span>`;
}

export function getNavbar(currentTab, currentUser) {
  const tabs = ['STATUS', 'DATA', 'GEOGRAPHY'];
  if (window.userRole === 'gm') tabs.push('OVERRIDE');

  return `
    <div class="terminal-nav">
      ${tabs.map(tab => `
        <button class="nav-btn ${currentTab === tab ? 'active' : ''}" 
                onclick="window.switchTab('${tab}')">
          ${tab}
        </button>
      `).join('')}
      <div style="flex-grow:1;"></div>
      <div style="color:var(--pip-green); font-size:12px; align-self:center;">
        USER: ${currentUser.toUpperCase()}
      </div>
    </div>
  `;
}

// --- REGISTRATION SCREEN (The G.O.A.T. Exam) ---
export function getRegistrationView(charId, liveData) {
  const char = liveData.characters[charId];
  if (!char) return `<h1>> ERROR: IDENTITY '${charId.toUpperCase()}' NOT FOUND — ASK YOUR GM TO SET UP THIS ACCESS CODE</h1>`;
  // Initialize Draft if missing
  const draft = window.creationDraft || {
    race: "human",
    special: { str: 5, per: 5, end: 5, cha: 5, int: 5, agi: 5, luk: 5 },
    tags: []
  };
  window.creationDraft = draft; 

  // Data Prep
  const TOTAL_POINTS = 40; 
  const currentSpent = Object.values(draft.special).reduce((a, b) => a + b, 0);
  const remaining = TOTAL_POINTS - currentSpent;
  const raceDef = RACE_RULES[draft.race] || RACE_RULES['human'];
  
  // Render Special Rows
  const renderRow = (stat, label) => {
    const val = draft.special[stat];
    const min = raceDef.min[stat];
    const max = raceDef.max[stat];
    
    const canMinus = val > min ? '' : 'disabled style="opacity:0.3"';
    const canPlus = (val < max && remaining > 0) ? '' : 'disabled style="opacity:0.3"';

    const isFocused = (draft.lastTouched || 'str') === stat;
    return `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px; border-bottom:1px dashed ${isFocused ? 'var(--pip-green)' : '#333'}; padding:5px;">
        <span style="width:50px; font-weight:bold; color:var(--pip-dim); cursor:pointer;" onclick="window.setCreationFocus('${stat}')">${renderWikiLink(label, SPECIAL_INFO[stat])}</span>
        <div style="display:flex; align-items:center; gap:10px;">
          <button ${canMinus} onclick="window.adjustCreationStat('${stat}', -1)">[-]</button>
          <span style="color:${val >= 10 ? 'gold' : 'var(--pip-green)'}; width:30px; text-align:center;">${val}</span>
          <button ${canPlus} onclick="window.adjustCreationStat('${stat}', 1)">[+]</button>
        </div>
        <span style="font-size:10px; color:#555; width:60px; text-align:right;">MIN ${min} / MAX ${max}</span>
      </div>
    `;
  };

  // Live derived-stat preview — calculateDerivedStats already computes
  // everything from a draft; the creation screen just never called it
  // before, so raising END from 5 to 7 gave no feedback at all about
  // what those two points actually bought.
  const previewDerived = calculateDerivedStats(draft.special, 1, [], [], draft.race, []);

  // Persistent flavor panel — New Vegas-style broad description per
  // stat, not per-value. Defaults to STR so the panel is never empty on
  // first load; setCreationFocus/adjustCreationStat both update
  // draft.lastTouched. Works identically on mobile (tap the label) and
  // desktop (tap +/-), unlike the old hover-only SPECIAL_INFO tooltip.
  const focusedStat = draft.lastTouched || 'str';
  const focusedLabel = { str: 'STRENGTH', per: 'PERCEPTION', end: 'ENDURANCE', cha: 'CHARISMA', int: 'INTELLIGENCE', agi: 'AGILITY', luk: 'LUCK' }[focusedStat];
  const flavor = SPECIAL_FLAVOR[focusedStat];

  // Render Skills
  const allSkills = Object.values(SKILL_CATEGORIES).flat();
  const skillGrid = allSkills.map(skill => {
    const isSelected = draft.tags.includes(skill);
    const style = isSelected ? "border-color:cyan; color:cyan; background:rgba(0,255,255,0.1);" : "border-color:#333; color:#555;";
    const disabled = (!isSelected && draft.tags.length >= 3) ? "opacity:0.3; pointer-events:none;" : "";
    // Hover-only tooltip (not renderWikiLink's onclick variant) — the
    // whole tile's own onclick already toggles the tag, and stacking a
    // second onclick on the text would stopPropagation and silently
    // break tapping to select on mobile. Desktop hover still explains
    // the skill; touch users just don't get a tap-tooltip here, same
    // as before this feature existed.
    const safeDesc = (SKILL_INFO[skill] || '').replace(/"/g, "&quot;").replace(/'/g, "\\'");
    return `<div onclick="window.toggleCreationTag('${skill}')" onmouseover="window.showTooltip('${safeDesc}', event)" onmouseout="window.hideTooltip()" style="border:1px solid; padding:5px; cursor:pointer; text-transform:uppercase; font-size:12px; text-align:center; ${style} ${disabled}">${skill.replace('_', ' ')}</div>`;
  }).join("");

  return `
    <div class="dashboard-container" style="display:block; max-width:600px; margin:0 auto; padding-top:20px;">
      <div class="panel" style="border:2px solid var(--pip-green); box-shadow:0 0 15px rgba(50,255,50,0.1);">
        <h1 style="text-align:center; background:var(--pip-green); color:black; margin:-10px -10px 20px -10px;">G.O.A.T. REGISTRATION</h1>
        
        <div style="display:flex; gap:20px; margin-bottom:20px;">
          <img src="${char.avatar_url}" style="width:100px; height:100px; border:1px solid var(--pip-green);">
          <div style="flex-grow:1;">
            <h2 style="margin:0; color:white;">IDENTITY: ${char.name}</h2>
            <div style="margin-top:10px;">
              <label>GENETIC STRAIN (RACE):</label><br>
              <select onchange="window.setCreationRace(this.value)" style="background:black; color:lime; border:1px solid lime; font-family:'VT323'; font-size:18px; width:100%;">
                ${Object.keys(RACE_RULES).map(r => `<option value="${r}" ${draft.race === r ? 'selected' : ''}>${RACE_RULES[r].name.toUpperCase()}</option>`).join('')}
              </select>
            </div>
          </div>
        </div>

        <div style="background:rgba(0,50,0,0.2); padding:10px; border:1px solid var(--pip-dim); margin-bottom:20px; font-size:14px; color:#aaa;">
           ${raceDef.description}
        </div>

        <div style="background:rgba(0,0,0,0.5); padding:10px; border:1px solid #333; margin-bottom:20px;">
          <div style="text-align:center; margin-bottom:10px;">
            POINTS POOL: <span style="font-size:24px; color:${remaining === 0 ? 'lime' : 'yellow'};">${remaining}</span>
          </div>
          ${renderRow('str', 'STR')} ${renderRow('per', 'PER')} ${renderRow('end', 'END')}
          ${renderRow('cha', 'CHA')} ${renderRow('int', 'INT')} ${renderRow('agi', 'AGI')} ${renderRow('luk', 'LUK')}
        </div>

        <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:6px; margin-bottom:20px; text-align:center;">
          <div style="border:1px solid #333; padding:6px;"><small style="color:#888;">HP</small><br><strong style="color:var(--pip-green);">${previewDerived.maxHpCalculated}</strong></div>
          <div style="border:1px solid #333; padding:6px;"><small style="color:#888;">AC</small><br><strong style="color:var(--pip-green);">${previewDerived.armorClass}</strong></div>
          <div style="border:1px solid #333; padding:6px;"><small style="color:#888;">CARRY</small><br><strong style="color:var(--pip-green);">${previewDerived.carryCapacity.toFixed(0)}kg</strong></div>
          <div style="border:1px solid #333; padding:6px;"><small style="color:#888;">SEQ</small><br><strong style="color:var(--pip-green);">${previewDerived.sequenceBonus}</strong></div>
        </div>

        <div style="border:1px solid var(--pip-dim); margin-bottom:20px;">
          ${flavor && flavor.image_url
            ? `<img src="${flavor.image_url}" style="width:100%; display:block; border-bottom:1px solid var(--pip-dim);">`
            : `<div style="aspect-ratio:1; display:flex; align-items:center; justify-content:center; color:#444; font-size:12px; border-bottom:1px solid var(--pip-dim);">[ ART PENDING — ${focusedLabel} ]</div>`}
          <div style="padding:10px;">
            <div style="color:var(--pip-green); font-weight:bold; margin-bottom:4px;">${focusedLabel}</div>
            <div style="font-size:13px; color:#ccc; line-height:1.5;">${(flavor && flavor.description) || ''}</div>
          </div>
        </div>

        <h3 style="border-bottom:1px solid var(--pip-dim);">TAG SKILLS (${draft.tags.length}/3)</h3>
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:5px; margin-bottom:20px;">${skillGrid}</div>

        <button onclick="window.finalizeCharacter()" 
          style="width:100%; padding:15px; font-size:24px; background:${(remaining === 0 && draft.tags.length === 3) ? 'var(--pip-green)' : '#333'}; color:black; font-family:'VT323'; border:none; cursor:pointer;"
          ${(remaining === 0 && draft.tags.length === 3) ? '' : 'disabled'}>
          ${(remaining === 0 && draft.tags.length === 3) ? 'PRINT IDENTITY CARD' : 'INCOMPLETE DATA'}
        </button>
      </div>
    </div>
  `;
}

// --- G.O.A.T. REVIEW (read-only look back at creation choices) ---
export function getGoatReviewView(charId, liveData) {
  const char = liveData.characters[charId];
  if (!char) return `<h1>> ERROR: IDENTITY '${charId.toUpperCase()}' NOT FOUND</h1>`;

  const raceDef = RACE_RULES[char.race] || RACE_RULES['human'];
  const tags = Object.keys(char.tags || {});

  const specialRows = SPECIAL_ORDER
    .map(k => `<div class="special-row"><span>${renderWikiLink(k.toUpperCase(), SPECIAL_INFO[k])}</span><span>${(char.special || {})[k] ?? '-'}</span></div>`)
    .join('');

  const tagsHtml = tags.length > 0
    ? tags.map(t => `<div style="border:1px solid cyan; color:cyan; padding:5px; text-align:center; text-transform:uppercase; font-size:12px;">${renderWikiLink(t.replace(/_/g, ' '), SKILL_INFO[t])}</div>`).join('')
    : '<span style="color:#555;">NONE RECORDED</span>';

  return `
    <div class="dashboard-container" style="display:block; max-width:600px; margin:0 auto; padding-top:20px;">
      <div class="panel" style="border:2px solid var(--pip-green); box-shadow:0 0 15px rgba(50,255,50,0.1);">
        <div style="display:flex; justify-content:space-between; align-items:center; background:var(--pip-green); margin:-10px -10px 20px -10px; padding:10px;">
          <h1 style="margin:0; color:black;">IDENTITY CARD</h1>
          <button onclick="window.switchTab('DASHBOARD')" style="background:black; color:lime; border:1px solid black; cursor:pointer;">BACK</button>
        </div>

        <div style="display:flex; gap:20px; margin-bottom:20px;">
          <img src="${char.avatar_url}" style="width:100px; height:100px; border:1px solid var(--pip-green);">
          <div>
            <h2 style="margin:0; color:white;">${char.name}</h2>
            <p style="color:var(--pip-dim); margin:5px 0 0;">${raceDef.name.toUpperCase()}</p>
          </div>
        </div>

        <div style="background:rgba(0,50,0,0.2); padding:10px; border:1px solid var(--pip-dim); margin-bottom:20px; font-size:14px; color:#aaa;">
          ${raceDef.description}
        </div>

        <h3 style="border-bottom:1px solid var(--pip-dim);">S.P.E.C.I.A.L. AT CREATION</h3>
        ${specialRows}

        <h3 style="border-bottom:1px solid var(--pip-dim); margin-top:20px;">TAG SKILLS</h3>
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:5px;">${tagsHtml}</div>

        ${char.gm_notes ? `
        <h3 style="border-bottom:1px solid gold; color:gold; margin-top:20px;">NOTES FROM YOUR GM</h3>
        <div style="font-size:14px; color:#ccc; line-height:1.5; white-space:pre-wrap;">${escapeHtml(char.gm_notes)}</div>` : ''}
      </div>
    </div>
  `;
}

// --- COMBAT VIEW ---
export function getCombatView(liveData, userRole, currentUser) {
  const combat = liveData.active_combat;
  if (!combat) return `<h1>> NO COMBAT RECORDED YET</h1>`;

  const isLive = combat.is_active;
  const currentActor = isLive ? combat.initiative_order[combat.turn_index] : null;

  // GM always sees exact HP; players need the "awareness" perk.
  let viewerHasAwareness = userRole === 'gm';
  if (!viewerHasAwareness) {
    const viewerChar = liveData.characters[currentUser];
    viewerHasAwareness = ((viewerChar && viewerChar.perks) || []).includes('awareness');
  }

  // PCs don't carry embedded HP (it stays live-linked to their real
  // character doc so combat never gets out of sync with the dashboard);
  // monster instances carry their own HP directly. Resolve either shape here.
  const resolveHp = (c) => {
    if (c.ref_type === 'pc') {
      const liveChar = liveData.characters[c.char_id];
      return liveChar ? liveChar.hp : { current: 0, max: 1 };
    }
    return c.hp;
  };

  const hpLabel = (c) => {
    if (c.is_down) return 'DOWN';
    const hp = resolveHp(c);
    const pct = (hp.current / hp.max) * 100;
    if (viewerHasAwareness) return `${hp.current}/${hp.max}`;
    if (pct >= 100) return 'HEALTHY';
    if (pct >= 75) return 'BRUISED';
    if (pct >= 50) return 'WOUNDED';
    if (pct >= 25) return 'BADLY WOUNDED';
    if (pct > 0) return 'NEAR DEATH';
    return 'DOWN';
  };

  // PC affliction tags — always visible in red, regardless of Awareness
  // (knowing *something* is wrong with someone is different from knowing
  // their exact HP, which stays gated).
  const afflictionTags = (c) => {
    if (c.ref_type !== 'pc') return '';
    const char = liveData.characters[c.char_id];
    const effects = (char && char.status_effects) || [];
    if (effects.length === 0) return '';
    return `<div style="margin-top:3px;">${effects.map(fx => `
      <span style="color:#ff5555; font-size:11px; border:1px solid #5a2020; padding:1px 5px; margin-right:4px; display:inline-block;">
        ${fx.name.toUpperCase()}${userRole === 'gm' ? `<span onclick="event.stopPropagation(); window.gmRemoveStatusEffectDirect('${c.char_id}', '${fx.id}')" style="cursor:pointer; margin-left:5px; font-weight:bold;" title="Resolve / remove">✕</span>` : ''}
      </span>`).join('')}</div>`;
  };

  // Stance is prominent right next to the name — free-form change, any
  // time, not gated to turn order (the GM governs that verbally). A
  // player can only change their own PC's; the GM can change anyone's,
  // PC or monster.
  const stanceHtml = (c) => {
    const current = (c.ref_type === 'pc' ? (liveData.characters[c.char_id] || {}).stance : c.stance) || 'standing';
    const canEdit = userRole === 'gm' || (c.ref_type === 'pc' && c.char_id === currentUser);
    const colors = { standing: '#666', crouching: 'cyan', prone: 'orange', knocked_down: 'red' };
    if (!canEdit) {
      return `<span style="font-size:11px; color:${colors[current]}; border:1px solid ${colors[current]}; padding:0 5px;">${STANCES[current].label.toUpperCase()}</span>`;
    }
    const options = Object.entries(STANCES).map(([key, s]) => `<option value="${key}" ${current === key ? 'selected' : ''}>${s.label}</option>`).join('');
    return `<select onclick="event.stopPropagation();" onchange="event.stopPropagation(); window.setStance('${c.combatant_id}', this.value)" style="font-size:11px; background:black; color:${colors[current]}; border:1px solid ${colors[current]}; padding:0 2px;">${options}</select>`;
  };

  // Cover (job 1 — SCOPE_DECISIONS.md "Combat, scrap, People tab, heist"
  // ruling: "Cover is GM-assigned"). GM-only control, unlike stance —
  // combat space is navigated manually at the table, so only the GM
  // calls it. A non-GM viewer just sees the current level, when it isn't
  // "None" (the common case stays uncluttered).
  const coverHtml = (c) => {
    const current = c.cover || 'none';
    if (userRole !== 'gm') {
      return current !== 'none' ? `<span style="font-size:11px; color:orange; border:1px solid orange; padding:0 5px; margin-left:4px;">${COVER_LEVELS[current].label.toUpperCase()}</span>` : '';
    }
    const options = Object.entries(COVER_LEVELS).map(([key, lvl]) => `<option value="${key}" ${current === key ? 'selected' : ''}>${lvl.label}</option>`).join('');
    return `<select onclick="event.stopPropagation();" onchange="event.stopPropagation(); window.setCover('${c.combatant_id}', this.value)" style="font-size:11px; background:black; color:orange; border:1px solid orange; padding:0 2px; margin-left:4px;">${options}</select>`;
  };

  const initiativeHtml = combat.initiative_order.map((c, idx) => {
    const isCurrent = isLive && idx === combat.turn_index;
    const hp = resolveHp(c);
    const pct = c.is_down ? 0 : (hp.current / hp.max) * 100;
    return `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:8px; margin-bottom:4px; border:1px solid ${isCurrent ? 'var(--pip-green)' : '#333'}; background:${isCurrent ? 'rgba(51,255,51,0.1)' : 'transparent'};">
        <div>
          <strong style="color:${c.ref_type === 'pc' ? 'cyan' : 'red'};">${isCurrent ? '▶ ' : ''}${c.name}</strong>
          ${stanceHtml(c)}
          ${coverHtml(c)}
          <div style="font-size:11px; color:#666;">INIT ${c.initiative}</div>
          ${afflictionTags(c)}
        </div>
        <div style="text-align:right;">
          <div class="hp-bar-container" style="width:100px;"><div class="hp-fill" style="width:${pct}%"></div></div>
          <div style="font-size:12px;">${hpLabel(c)}</div>
        </div>
      </div>`;
  }).join('');

  const logHtml = (combat.log || []).slice().reverse().map(entry => `
      <div style="padding:4px 0; border-bottom:1px dashed #222; font-size:13px;">
        <span style="color:#555; font-size:10px;">${new Date(entry.timestamp).toLocaleTimeString()}</span>
        <span style="color:${entry.type === 'system' ? 'gold' : 'var(--pip-green)'};"> ${entry.message}</span>
      </div>`).join('');

  const headerHtml = isLive
    ? `<h2 style="color:red;">⚔ COMBAT — ROUND ${combat.round}</h2>
       <p style="color:var(--pip-dim); font-size:13px;">CURRENT TURN: <strong style="color:var(--pip-green);">${currentActor ? currentActor.name : '—'}</strong></p>`
    : `<h2 style="color:#888;">⚔ COMBAT ENDED</h2>
       <p style="color:var(--pip-dim); font-size:13px;">${combat.summary || 'No summary recorded.'}</p>`;

  // --- Whose turn can THIS viewer act for? GM can always act; a player
  // only during their own PC's turn. One action per turn (no AP economy) —
  // once turn_acted is set, the action panel disappears until End Turn.
  const canActThisTurn = isLive && currentActor && !combat.turn_acted && (
    userRole === 'gm' || (currentActor.ref_type === 'pc' && currentActor.char_id === currentUser)
  );
  const isMyIdleTurn = isLive && currentActor && combat.turn_acted && (
    userRole === 'gm' || (currentActor.ref_type === 'pc' && currentActor.char_id === currentUser)
  );
  const canEndTurn = isLive && (userRole === 'gm' || canActThisTurn || isMyIdleTurn);

  let actionPanelHtml = '';
  if (canActThisTurn) {
    const draft = window.combatActionDraft || {};
    // PC turns target the opposing side only (a player attacking a
    // teammate should go through the GM, not be a default option).
    // Monster/NPC turns can target anyone else — chaos, mind control,
    // an animal turning on an ally, etc.
    const opposingSide = currentActor.ref_type === 'pc' ? 'monster' : 'pc';
    const targetOptions = combat.initiative_order
      .filter(c => c.combatant_id !== currentActor.combatant_id && !c.is_down &&
        (currentActor.ref_type === 'monster' || c.ref_type === opposingSide))
      .map(c => `<option value="${c.combatant_id}" ${draft.targetId === c.combatant_id ? 'selected' : ''}>${c.name}</option>`).join('');

    let attackOptions = '';
    if (currentActor.ref_type === 'monster') {
      // Job 3: show each attack's damage type (new per-attack `dmgType`,
      // defaulting to normal when absent — matches computeAttackResolution).
      attackOptions = (currentActor.attacks || [])
        .map(a => {
          const dmgTypeLabel = DAMAGE_TYPE_LABELS[a.dmgType || 'normal'];
          return `<option value="${a.name}" ${draft.attackKey === a.name ? 'selected' : ''}>${a.name} (${a.hit_percent}% · ${a.damage}${dmgTypeLabel ? ` · ${dmgTypeLabel}` : ''})</option>`;
        }).join('');
    } else {
      const char = liveData.characters[currentActor.char_id];
      const equip = (char && char.equipment) || {};
      const ammo = (char && char.ammo) || {};
      const seen = new Set();
      const weaponOpts = [equip.right_hand, equip.left_hand].filter(Boolean).map(itemId => {
        if (seen.has(itemId)) return '';
        seen.add(itemId);
        const item = getItem(itemId);
        if (!item) return '';
        const slot = equip.right_hand === itemId ? 'right_hand' : 'left_hand';
        const itemClipSize = item.stats && item.stats.clip_size;
        const ammoTag = itemClipSize ? ` (${ammo[slot] ?? itemClipSize}/${itemClipSize} ammo)` : '';
        // Job 3: show the weapon's own damage type (stats.dmgType, default normal).
        const dmgTypeLabel = DAMAGE_TYPE_LABELS[(item.stats && item.stats.dmgType) || 'normal'];
        const typeTag = dmgTypeLabel ? ` [${dmgTypeLabel}]` : '';
        return `<option value="${itemId}" ${draft.attackKey === itemId ? 'selected' : ''}>${item.name}${ammoTag}${typeTag}</option>`;
      }).join('');
      attackOptions = `<option value="unarmed" ${!draft.attackKey || draft.attackKey === 'unarmed' ? 'selected' : ''}>Unarmed</option>${weaponOpts}`;
    }

    // Ammo/burst — a simplified stand-in for the manual's full multi-roll
    // burst system (agreed with the user): one roll at a flat hit%
    // penalty, roughly double damage, costs the weapon's burst_shots in
    // ammo instead of 1. PC-only (matches resolveAttack() — monster
    // attacks are hand-authored in the bestiary and don't carry ammo).
    let ammoHtml = '';
    let burstSelected = false;
    let equippedWeaponItem = null, equippedWeaponSlot = null;
    if (currentActor.ref_type === 'pc' && draft.attackKey && draft.attackKey !== 'unarmed') {
      const char = liveData.characters[currentActor.char_id];
      const equip = (char && char.equipment) || {};
      equippedWeaponItem = getItem(draft.attackKey);
      equippedWeaponSlot = equip.right_hand === draft.attackKey ? 'right_hand' : equip.left_hand === draft.attackKey ? 'left_hand' : null;
      // ammo_type/clip_size/burst_shots all live under the weapon's
      // `stats` block, alongside dmg/range/dmgType.
      const equippedStats = (equippedWeaponItem && equippedWeaponItem.stats) || {};
      if (equippedWeaponItem && equippedStats.clip_size && equippedWeaponSlot) {
        const currentAmmo = ((char.ammo || {})[equippedWeaponSlot]) ?? equippedStats.clip_size;
        burstSelected = !!(draft.burst && equippedStats.burst_shots);
        const burstOption = equippedStats.burst_shots ? `
          <label style="font-size:11px; color:#666; display:flex; align-items:center; gap:6px; margin-bottom:6px;">
            <input type="checkbox" ${burstSelected ? 'checked' : ''} onchange="window.setCombatActionField('burst', this.checked)">
            🔥 BURST FIRE (-${BURST_HIT_PENALTY}% hit, ~2x damage, uses ${equippedStats.burst_shots} ammo)
          </label>` : '';
        // Spare-rounds count only applies to weapons authored with an
        // ammo_type — a weapon without one reloads for free (no real
        // inventory ammo item to track), same as before this feature.
        const spareTag = equippedStats.ammo_type
          ? ` <span style="color:#666;">(spare: ${Object.keys(normalizeInventory(char.inventory)).filter(id => { const d = getItem(id); return d && d.type === 'ammo' && d.ammo_type === equippedStats.ammo_type; }).reduce((sum, id) => sum + getInventoryQuantity(char.inventory, id), 0)})</span>`
          : '';
        ammoHtml = `
          <div style="display:flex; align-items:center; justify-content:space-between; font-size:11px; color:#888; margin-bottom:6px;">
            <span>Ammo: <span style="color:var(--pip-green);">${currentAmmo}/${equippedStats.clip_size}</span>${spareTag}</span>
            <button class="gm-btn" style="padding:2px 8px; font-size:10px;" onclick="window.reloadWeapon('${currentActor.char_id}', '${equippedWeaponSlot}')">RELOAD</button>
          </div>
          ${burstOption}`;
      }
    }

    // Aimed shots (VATS-style targeted shot) — attacker-agnostic, same as
    // resolveAttack(): torso is just the normal attack, always available,
    // 0 penalty. Works for a PC's turn OR a GM-controlled monster's turn
    // (a called shot works the same regardless of who's pulling the
    // trigger — this is also what makes the Blinded/Crippled effects
    // reachable at all, since PCs can only target monsters and monsters
    // don't carry status effects).
    let bodyPartHtml = '';
    {
      const selectedPart = draft.bodyPart || 'torso';
      const bodyPartOptions = Object.entries(BODY_PARTS)
        .map(([key, part]) => `<option value="${key}" ${selectedPart === key ? 'selected' : ''}>${part.label}${part.penalty ? ` (-${part.penalty}%)` : ''}</option>`).join('');

      // Live hit% preview — replicates the same effectiveChance math used
      // in resolveAttack() (combat.js resolveHit: max(0, skill - penalty - AC)),
      // recomputed here at render time so it updates as target/attack/part change.
      let previewHtml = '';
      const target = combat.initiative_order.find(c => c.combatant_id === draft.targetId);
      if (target) {
        let attackerValue = null;
        let isMeleeAttack = false; // job 1: cover only penalizes ranged attacks
        if (currentActor.ref_type === 'monster') {
          const attackDef = (currentActor.attacks || []).find(a => a.name === draft.attackKey);
          if (attackDef) {
            attackerValue = attackDef.hit_percent;
            isMeleeAttack = isMonsterAttackMelee(attackDef);
          }
        } else {
          const char = liveData.characters[currentActor.char_id];
          const derived = deriveCharacter(char);
          if (!draft.attackKey || draft.attackKey === 'unarmed') {
            attackerValue = derived.skills.unarmed;
            isMeleeAttack = true;
          } else {
            const weaponItem = getItem(draft.attackKey);
            if (weaponItem) {
              const isMelee = !weaponItem.stats || (weaponItem.stats.range || 0) <= 1;
              isMeleeAttack = isMelee;
              const skillKey = weaponItem.skill || (isMelee ? 'melee_weapons' : 'small_guns');
              attackerValue = derived.skills[skillKey] ?? 0;
            }
          }
        }
        // Same stance-aware AC the attack itself rolls against.
        const targetAC = effectiveTargetAC(target, liveData.characters);
        if (attackerValue !== null && targetAC !== null) {
          const part = BODY_PARTS[selectedPart] || BODY_PARTS.torso;
          // Job 1: same cover penalty computeAttackResolution() applies —
          // GM-assigned on the target, ranged attacks only.
          const coverLevel = COVER_LEVELS[target.cover || 'none'] || COVER_LEVELS.none;
          const coverPenalty = !isMeleeAttack ? coverLevel.penalty : 0;
          const chance = Math.max(0, attackerValue - part.penalty - (burstSelected ? BURST_HIT_PENALTY : 0) - coverPenalty - targetAC);
          const coverNote = coverPenalty > 0 ? ` <span style="color:orange;">(${coverLevel.label} −${coverPenalty})</span>` : '';
          previewHtml = `<div style="font-size:11px; color:#888; margin-bottom:6px;">Hit chance vs ${target.name}: <span style="color:var(--pip-green); font-weight:bold;">${chance}%</span>${coverNote}</div>`;
        }
      }

      bodyPartHtml = `
        <label style="font-size:11px; color:#666;">AIMED SHOT (optional — defaults to Torso)</label>
        <select onchange="window.setCombatActionField('bodyPart', this.value)" style="width:100%; background:black; color:lime; border:1px solid #333; margin-bottom:6px;">
          ${bodyPartOptions}
        </select>
        ${previewHtml}`;
    }

    actionPanelHtml = `
      <div class="panel" style="margin-bottom:15px;">
        <h3 style="color:var(--pip-green); margin-top:0;">${currentActor.name}'S TURN</h3>
        <label style="font-size:11px; color:#666;">TARGET</label>
        <select onchange="window.setCombatActionField('targetId', this.value)" style="width:100%; background:black; color:lime; border:1px solid #333; margin-bottom:8px;">
          <option value="">— choose —</option>${targetOptions}
        </select>
        <label style="font-size:11px; color:#666;">ATTACK</label>
        <select onchange="window.setCombatActionField('attackKey', this.value)" style="width:100%; background:black; color:lime; border:1px solid #333; margin-bottom:8px;">
          <option value="">— choose —</option>${attackOptions}
        </select>
        ${ammoHtml}
        ${bodyPartHtml}
        <label style="font-size:11px; color:#666;">ROLL (1-100)</label>
        <div style="display:flex; gap:6px; margin-bottom:10px;">
          <input type="number" id="combatRollInput" min="1" max="100" value="${draft.roll ?? ''}" oninput="window.setCombatActionField('roll', this.value)" style="flex-grow:1; background:black; color:lime; border:1px solid #333;">
          ${currentActor.ref_type === 'pc' ? `<button class="gm-btn" onclick="window.rollForMe()">🎲 ROLL</button>` : ''}
        </div>
        <button style="width:100%; padding:10px; background:var(--pip-green); color:black; font-weight:bold; border:none; cursor:pointer; margin-bottom:6px;" onclick="window.resolveAttack()">RESOLVE ATTACK</button>
        <button style="width:100%; padding:6px; background:#333; color:#aaa; border:none; cursor:pointer;" onclick="window.passTurn()">PASS</button>
      </div>`;
  } else if (isMyIdleTurn) {
    actionPanelHtml = `
      <div class="panel" style="margin-bottom:15px;">
        <h3 style="color:var(--pip-dim); margin-top:0;">${currentActor.name}'S TURN</h3>
        <p style="color:#888; font-size:13px;">Action taken this turn. Click END TURN when ready to move on.</p>
      </div>`;
  }

  const bestiaryQuickOptions = Object.values(bestiaryDatabase)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(m => `<option value="${m.id}">${m.name}</option>`).join('');
  const addCombatantHtml = isLive && userRole === 'gm' ? `
    <div class="panel" style="margin-bottom:15px;">
      <h4 style="color:orange; margin-top:0;">ADD COMBATANT</h4>
      <div style="display:flex; gap:6px;">
        <select id="midFightMonsterSelect" style="flex-grow:1; background:black; color:orange; border:1px solid orange;">${bestiaryQuickOptions}</select>
        <button class="gm-btn" style="border-color:orange; color:orange;" onclick="window.addCombatantMidFight(document.getElementById('midFightMonsterSelect').value)">ADD</button>
      </div>
    </div>` : '';

  const hpTargetOptions = isLive ? combat.initiative_order
    .map(c => `<option value="${c.combatant_id}">${c.name}${c.is_down ? ' (DOWN)' : ''}</option>`).join('') : '';
  const itemPickOptions = `<option value="">— none, just typing a reason —</option>${Object.values(itemDatabase)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(item => `<option value="${item.name}">${item.name}</option>`).join('')}`;
  const adjustHpHtml = isLive && userRole === 'gm' ? `
    <div class="panel" style="margin-bottom:15px;">
      <h4 style="color:lime; margin-top:0;">ADJUST HP / USE ITEM</h4>
      <label style="font-size:11px; color:#666;">ON</label>
      <select id="hpAdjustTarget" style="width:100%; background:black; color:lime; border:1px solid #333; margin-bottom:6px;">${hpTargetOptions}</select>
      <label style="font-size:11px; color:#666;">ITEM USED (optional, fills reason)</label>
      <select id="hpAdjustItem" style="width:100%; background:black; color:lime; border:1px solid #333; margin-bottom:6px;"
        onchange="if (this.value) document.getElementById('hpAdjustReason').value = 'Used ' + this.value;">${itemPickOptions}</select>
      <label style="font-size:11px; color:#666;">REASON (for the combat log)</label>
      <input type="text" id="hpAdjustReason" placeholder="e.g. Used Stimpak" style="width:100%; background:black; color:lime; border:1px solid #333; margin-bottom:6px;">
      <label style="font-size:11px; color:#666;">HP CHANGE (+ or -)</label>
      <input type="number" id="hpAdjustDelta" placeholder="-5 or 10" style="width:100%; background:black; color:lime; border:1px solid #333; margin-bottom:8px;">
      <button class="gm-btn" style="width:100%; border-color:lime; color:lime;" onclick="window.gmAdjustCombatantHP(document.getElementById('hpAdjustTarget').value, Number(document.getElementById('hpAdjustDelta').value), document.getElementById('hpAdjustReason').value)">APPLY</button>
    </div>` : '';

  const pcTargetOptions = combat.initiative_order
    .filter(c => c.ref_type === 'pc')
    .map(c => `<option value="${c.char_id}">${c.name}</option>`).join('');
  const combatEffectOptions = Object.values(statusEffectDatabase)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(fx => `<option value="${fx.id}">${fx.name}</option>`).join('');
  const afflictPcHtml = isLive && userRole === 'gm' ? `
    <div class="panel" style="margin-bottom:15px;">
      <h4 style="color:#ff5555; margin-top:0;">AFFLICT PC</h4>
      <select id="combatEffectTargetSelect" style="width:100%; background:black; color:#ff5555; border:1px solid #ff5555; margin-bottom:6px;">
        <option value="">— choose PC —</option>${pcTargetOptions}
      </select>
      <select id="combatEffectSelect" style="width:100%; background:black; color:#ff5555; border:1px solid #ff5555; margin-bottom:6px;"
        onchange="document.getElementById('combatEffectCustomFields').style.display = this.value === '__custom__' ? 'flex' : 'none';">
        ${combatEffectOptions}
        <option value="__custom__">— CUSTOM (type your own) —</option>
      </select>
      <div id="combatEffectCustomFields" style="display:${combatEffectOptions ? 'none' : 'flex'}; flex-direction:column; gap:6px; margin-bottom:6px;">
        <input type="text" id="combatEffectCustomName" placeholder="NAME (e.g. Bleeding)" style="background:black; color:#ff5555; border:1px solid #333;">
        <input type="text" id="combatEffectCustomModifiers" placeholder="MODIFIERS e.g. special_end:-2" style="background:black; color:#ff5555; border:1px solid #333;">
      </div>
      <button class="gm-btn" style="width:100%; border-color:#ff5555; color:#ff5555;" onclick="window.gmApplyStatusEffectInCombat()">APPLY</button>
    </div>` : '';

  // Job 4 ("Weapon swapping costs a major action and needs GM approval"):
  // pending requests, GM-only, with approve/deny — see requestWeaponSwap/
  // gmApproveWeaponSwap/gmDenyWeaponSwap in controllers.js.
  const pendingSwaps = (combat.pending_weapon_swaps || []);
  const pendingSwapHtml = isLive && userRole === 'gm' && pendingSwaps.length > 0 ? `
    <div class="panel" style="margin-bottom:15px; border-color:gold;">
      <h4 style="color:gold; margin-top:0;">⚠ WEAPON SWAP REQUESTS</h4>
      ${pendingSwaps.map(req => {
        const reqChar = liveData.characters[req.char_id];
        const reqItem = getItem(req.item_id);
        return `
        <div style="border:1px solid #444; padding:6px 8px; margin-bottom:6px;">
          <div style="font-size:13px; margin-bottom:6px;">${(reqChar && reqChar.name) || req.char_id} wants to equip <strong>${(reqItem && reqItem.name) || req.item_id}</strong> (${req.target_slot === 'left_hand' ? 'L. hand' : 'R. hand'}).</div>
          <div style="display:flex; gap:6px;">
            <button class="gm-btn" style="flex-grow:1; border-color:lime; color:lime;" onclick="window.gmApproveWeaponSwap('${req.id}')">APPROVE</button>
            <button class="gm-btn" style="flex-grow:1; border-color:red; color:red;" onclick="window.gmDenyWeaponSwap('${req.id}')">DENY</button>
          </div>
        </div>`;
      }).join('')}
    </div>` : '';

  return `
    <div class="dashboard-container" style="grid-template-columns: minmax(240px, 320px) minmax(240px, 320px) minmax(220px, 1fr);">
      <div class="panel">
        ${headerHtml}
        <div id="initiative-list" style="margin-top:15px;">${initiativeHtml}</div>
        ${canEndTurn ? `<button style="width:100%; margin-top:15px; padding:10px; background:var(--pip-dim); color:black; font-weight:bold; border:none; cursor:pointer;" onclick="window.endTurn()">END TURN</button>` : ''}
        ${isLive && userRole === 'gm' ? `<button style="width:100%; margin-top:8px; padding:10px; background:red; color:white; border:none; cursor:pointer;" onclick="window.endCombat()">END COMBAT</button>` : ''}
        <button style="width:100%; margin-top:8px; padding:8px; background:#333; color:var(--pip-green); border:none; cursor:pointer;" onclick="window.switchTab('DASHBOARD')">BACK TO DASHBOARD</button>
      </div>
      <div>
        ${pendingSwapHtml}
        ${actionPanelHtml}
        ${afflictPcHtml}
        ${adjustHpHtml}
        ${addCombatantHtml}
        ${!pendingSwapHtml && !actionPanelHtml && !afflictPcHtml && !adjustHpHtml && !addCombatantHtml ? `<div class="panel" style="color:#555; font-size:13px;">${isLive ? "Waiting on this combatant's turn." : 'Combat has ended.'}</div>` : ''}
      </div>
      <div class="panel">
        <h2>COMBAT LOG</h2>
        ${userRole === 'gm' && liveData.last_resolution && liveData.last_resolution.kind === 'attack' ? `
        <div style="border:1px solid orange; padding:8px; margin-bottom:10px;">
          <div style="font-size:11px; color:orange;">LAST ACTION: ${liveData.last_resolution.actor} vs ${liveData.last_resolution.target} (rolled ${liveData.last_resolution.roll})</div>
          <button style="width:100%; margin-top:6px; padding:6px; background:orange; color:black; font-weight:bold; border:none; cursor:pointer;" onclick="window.gmRerollLastResolution()">↻ REROLL (GM ONLY)</button>
        </div>` : ''}
        <div style="max-height:500px; overflow-y:auto;">${logHtml || '<span style="color:#555;">No events yet.</span>'}</div>
      </div>
    </div>
  `;
}

// --- DIFFICULTY CHECKS ---
const SPECIAL_KEYS = ['str', 'per', 'end', 'cha', 'int', 'agi', 'luk'];
const SKILL_KEYS = Object.keys(SKILL_INFO);

function buildWhatOptions(selectedKind, selectedKey) {
  const specialOpts = SPECIAL_KEYS.map(k => `<option value="special:${k}" ${selectedKind === 'special' && selectedKey === k ? 'selected' : ''}>${k.toUpperCase()}</option>`).join('');
  const skillOpts = SKILL_KEYS.map(k => `<option value="skill:${k}" ${selectedKind === 'skill' && selectedKey === k ? 'selected' : ''}>${k.replace(/_/g, ' ').toUpperCase()}</option>`).join('');
  return `<optgroup label="SPECIAL">${specialOpts}</optgroup><optgroup label="SKILLS">${skillOpts}</optgroup>`;
}

function buildTierOptions(selectedTier) {
  return Object.entries(DIFFICULTY_TIERS).map(([key, tier]) =>
    `<option value="${key}" ${selectedTier === key ? 'selected' : ''}>${tier.label}${tier.skillMod ? ` (${tier.specialMod}/${tier.skillMod})` : ''}</option>`
  ).join('');
}

function formatCheckResultLine(r) {
  const critTag = r.critType === 'success' ? ' <span style="color:gold;">CRITICAL!</span>' : r.critType === 'fail' ? ' <span style="color:red;">CRITICAL FAIL!</span>' : '';
  return `<span style="color:${r.success ? 'var(--pip-green)' : '#d4574a'};">${r.success ? 'SUCCESS' : 'FAILURE'}</span>${critTag} <span style="color:#666; font-size:11px;">(rolled ${r.roll} vs ${r.threshold})</span>`;
}

// GM: HIDDEN ROLL — distinct from the GM check's own "reveal" checkbox
// (which hides a check from players entirely until/unless revealed).
// This roll's outcome is ALWAYS GM-only, but resolving it always posts an
// event-log line every player sees, naming nothing: "a hidden check was
// rolled," never what it was or how it went (GM ruling 2026-09-24).
function renderHiddenRollPanel(chars) {
  const draft = window.hiddenCheckDraft || { scope: 'single', targetCharId: '', kind: 'special', key: 'str', tier: 'normal', useD20: false, customName: '', customValue: '', roll: '' };
  window.hiddenCheckDraft = draft;
  const maxRoll = draft.kind === 'special' ? (draft.useD20 ? 20 : 10) : 100;
  const charOptions = Object.entries(chars).filter(([, c]) => c.is_finalized)
    .map(([id, c]) => `<option value="${id}" ${draft.targetCharId === id ? 'selected' : ''}>${c.name}</option>`).join('');

  return `
      <div class="panel" style="margin-bottom:15px; border-color:#a33;">
        <h3 style="color:#f66; margin-top:0;">GM: HIDDEN ROLL</h3>
        <p style="font-size:11px; color:#888; margin-top:-4px;">Only you ever see the result. Every player is told a hidden check happened — never for what, never the outcome.</p>
        <label style="font-size:11px; color:#666;">TARGET</label>
        <select onchange="window.setHiddenCheckField('scope', this.value)" style="width:100%; background:black; color:#f66; border:1px solid #a33; margin-bottom:8px;">
          <option value="single" ${draft.scope === 'single' ? 'selected' : ''}>SINGLE CHARACTER</option>
          <option value="custom" ${draft.scope === 'custom' ? 'selected' : ''}>CUSTOM / NPC</option>
        </select>
        ${draft.scope === 'single' ? `
        <select onchange="window.setHiddenCheckField('targetCharId', this.value)" style="width:100%; background:black; color:#f66; border:1px solid #a33; margin-bottom:8px;">
          <option value="">— choose —</option>${charOptions}
        </select>` : ''}
        ${draft.scope === 'custom' ? `
        <input type="text" placeholder="NAME (e.g. Raider Lookout)" value="${draft.customName || ''}" oninput="window.setHiddenCheckField('customName', this.value)" style="width:100%; background:black; color:#f66; border:1px solid #a33; margin-bottom:6px;">
        <input type="number" placeholder="CHECK VALUE (stat or skill %)" value="${draft.customValue ?? ''}" oninput="window.setHiddenCheckField('customValue', this.value)" style="width:100%; background:black; color:#f66; border:1px solid #a33; margin-bottom:8px;">` : ''}
        <label style="font-size:11px; color:#666;">WHAT ${draft.scope === 'custom' ? '(picks which modifier column applies)' : ''}</label>
        <select onchange="window.setHiddenCheckWhat(this.value)" style="width:100%; background:black; color:#f66; border:1px solid #a33; margin-bottom:8px;">
          ${buildWhatOptions(draft.kind, draft.key)}
        </select>
        <label style="font-size:11px; color:#666;">DIFFICULTY</label>
        <select onchange="window.setHiddenCheckField('tier', this.value)" style="width:100%; background:black; color:#f66; border:1px solid #a33; margin-bottom:8px;">
          ${buildTierOptions(draft.tier)}
        </select>
        ${draft.kind === 'special' ? `
        <label style="font-size:11px; color:#666; display:flex; align-items:center; gap:6px; margin-bottom:8px;">
          <input type="checkbox" ${draft.useD20 ? 'checked' : ''} onchange="window.setHiddenCheckField('useD20', this.checked)">
          Especially difficult task — roll 1d20 instead of 1d10
        </label>` : ''}
        <label style="font-size:11px; color:#666;">ROLL (1-${maxRoll})</label>
        <div style="display:flex; gap:6px; margin-bottom:10px;">
          <input type="number" id="hiddenCheckRollInput" min="1" max="${maxRoll}" value="${draft.roll ?? ''}" oninput="window.setHiddenCheckField('roll', this.value)" style="flex-grow:1; background:black; color:#f66; border:1px solid #a33;">
          <button class="gm-btn" style="border-color:#f66; color:#f66;" onclick="window.rollForHiddenCheck()">🎲 ROLL</button>
        </div>
        <button style="width:100%; padding:10px; background:#a33; color:white; font-weight:bold; border:none; cursor:pointer;" onclick="window.resolveHiddenCheck()">RESOLVE HIDDEN ROLL</button>
      </div>`;
}

export function getChecksView(liveData, userRole, currentUser) {
  const checks = liveData.checks || [];
  const chars = liveData.characters || {};

  let playerPanelHtml = '';
  if (userRole === 'player') {
    const draft = window.playerCheckDraft || { kind: 'special', key: 'str', tier: 'normal', useD20: false, roll: '' };
    window.playerCheckDraft = draft;
    const maxRoll = draft.kind === 'special' ? (draft.useD20 ? 20 : 10) : 100;
    playerPanelHtml = `
      <div class="panel" style="margin-bottom:15px;">
        <h3 style="color:var(--pip-green); margin-top:0;">ROLL A CHECK</h3>
        <label style="font-size:11px; color:#666;">WHAT</label>
        <select onchange="window.setPlayerCheckWhat(this.value)" style="width:100%; background:black; color:lime; border:1px solid #333; margin-bottom:8px;">
          ${buildWhatOptions(draft.kind, draft.key)}
        </select>
        <label style="font-size:11px; color:#666;">DIFFICULTY (as called by your GM)</label>
        <select onchange="window.setPlayerCheckField('tier', this.value)" style="width:100%; background:black; color:lime; border:1px solid #333; margin-bottom:8px;">
          ${buildTierOptions(draft.tier)}
        </select>
        ${draft.kind === 'special' ? `
        <label style="font-size:11px; color:#666; display:flex; align-items:center; gap:6px; margin-bottom:8px;">
          <input type="checkbox" ${draft.useD20 ? 'checked' : ''} onchange="window.setPlayerCheckField('useD20', this.checked)">
          Especially difficult task — roll 1d20 instead of 1d10
        </label>` : ''}
        <label style="font-size:11px; color:#666;">ROLL (1-${maxRoll})</label>
        <div style="display:flex; gap:6px; margin-bottom:10px;">
          <input type="number" id="playerCheckRollInput" min="1" max="${maxRoll}" value="${draft.roll ?? ''}" oninput="window.setPlayerCheckField('roll', this.value)" style="flex-grow:1; background:black; color:lime; border:1px solid #333;">
          <button class="gm-btn" onclick="window.rollForPlayerCheck()">🎲 ROLL</button>
        </div>
        <button style="width:100%; padding:10px; background:var(--pip-green); color:black; font-weight:bold; border:none; cursor:pointer;" onclick="window.resolvePlayerCheck()">RESOLVE CHECK</button>
      </div>`;
  }

  let gmPanelHtml = '';
  if (userRole === 'gm') {
    const draft = window.gmCheckDraft || { scope: 'single', targetCharId: '', kind: 'special', key: 'str', tier: 'normal', useD20: false, reveal: true, customName: '', customValue: '', roll: '' };
    window.gmCheckDraft = draft;
    const maxRoll = draft.kind === 'special' ? (draft.useD20 ? 20 : 10) : 100;
    const charOptions = Object.entries(chars).filter(([, c]) => c.is_finalized)
      .map(([id, c]) => `<option value="${id}" ${draft.targetCharId === id ? 'selected' : ''}>${c.name}</option>`).join('');

    gmPanelHtml = `
      <div class="panel" style="margin-bottom:15px;">
        <h3 style="color:orange; margin-top:0;">GM: ROLL A CHECK</h3>
        <label style="font-size:11px; color:#666;">TARGET</label>
        <select onchange="window.setGmCheckField('scope', this.value)" style="width:100%; background:black; color:orange; border:1px solid orange; margin-bottom:8px;">
          <option value="single" ${draft.scope === 'single' ? 'selected' : ''}>SINGLE CHARACTER</option>
          <option value="party" ${draft.scope === 'party' ? 'selected' : ''}>WHOLE PARTY (each rolls their own)</option>
          <option value="custom" ${draft.scope === 'custom' ? 'selected' : ''}>CUSTOM / NPC</option>
        </select>
        ${draft.scope === 'single' ? `
        <select onchange="window.setGmCheckField('targetCharId', this.value)" style="width:100%; background:black; color:orange; border:1px solid orange; margin-bottom:8px;">
          <option value="">— choose —</option>${charOptions}
        </select>` : ''}
        ${draft.scope === 'custom' ? `
        <input type="text" placeholder="NAME (e.g. Raider Lookout)" value="${draft.customName || ''}" oninput="window.setGmCheckField('customName', this.value)" style="width:100%; background:black; color:orange; border:1px solid orange; margin-bottom:6px;">
        <input type="number" placeholder="CHECK VALUE (stat or skill %)" value="${draft.customValue ?? ''}" oninput="window.setGmCheckField('customValue', this.value)" style="width:100%; background:black; color:orange; border:1px solid orange; margin-bottom:8px;">` : ''}
        <label style="font-size:11px; color:#666;">WHAT ${draft.scope === 'custom' ? '(picks which modifier column applies)' : ''}</label>
        <select onchange="window.setGmCheckWhat(this.value)" style="width:100%; background:black; color:orange; border:1px solid orange; margin-bottom:8px;">
          ${buildWhatOptions(draft.kind, draft.key)}
        </select>
        <label style="font-size:11px; color:#666;">DIFFICULTY</label>
        <select onchange="window.setGmCheckField('tier', this.value)" style="width:100%; background:black; color:orange; border:1px solid orange; margin-bottom:8px;">
          ${buildTierOptions(draft.tier)}
        </select>
        ${draft.kind === 'special' ? `
        <label style="font-size:11px; color:#666; display:flex; align-items:center; gap:6px; margin-bottom:8px;">
          <input type="checkbox" ${draft.useD20 ? 'checked' : ''} onchange="window.setGmCheckField('useD20', this.checked)">
          Especially difficult task — roll 1d20 instead of 1d10
        </label>` : ''}
        ${draft.scope !== 'party' ? `
        <label style="font-size:11px; color:#666;">ROLL (1-${maxRoll})</label>
        <div style="display:flex; gap:6px; margin-bottom:8px;">
          <input type="number" id="gmCheckRollInput" min="1" max="${maxRoll}" value="${draft.roll ?? ''}" oninput="window.setGmCheckField('roll', this.value)" style="flex-grow:1; background:black; color:orange; border:1px solid orange;">
          <button class="gm-btn" style="border-color:orange; color:orange;" onclick="window.rollForGmCheck()">🎲 ROLL</button>
        </div>` : `<p style="font-size:11px; color:#666; margin-bottom:8px;">Each party member auto-rolls their own dice when resolved.</p>`}
        <label style="font-size:11px; color:#666; display:flex; align-items:center; gap:6px; margin-bottom:10px;">
          <input type="checkbox" ${draft.reveal ? 'checked' : ''} onchange="window.setGmCheckField('reveal', this.checked)">
          Reveal result to all players immediately (a message gets sent)
        </label>
        <button style="width:100%; padding:10px; background:orange; color:black; font-weight:bold; border:none; cursor:pointer;" onclick="window.resolveGmCheck()">RESOLVE CHECK</button>
      </div>`;

    gmPanelHtml += renderHiddenRollPanel(chars);
  }

  const visibleChecks = checks.filter(c => userRole === 'gm' || !c.hidden);
  const checkLogHtml = visibleChecks.slice().reverse().map(entry => {
    const tierLabel = (DIFFICULTY_TIERS[entry.tier] || {}).label || entry.tier;
    const whatLabel = entry.key ? entry.key.replace(/_/g, ' ').toUpperCase() : (entry.kind === 'special' ? 'SPECIAL' : 'SKILL');
    const hiddenTag = entry.hidden ? `<span style="color:red; font-size:10px; border:1px solid red; padding:1px 4px; margin-left:6px;">HIDDEN — NOT REVEALED</span>` : '';
    const revealBtn = (userRole === 'gm' && entry.hidden) ? `<button class="gm-btn" style="margin-top:4px; padding:2px 8px; font-size:10px;" onclick="window.revealCheck('${entry.id}')">REVEAL TO PLAYERS</button>` : '';
    const resultsHtml = entry.results.map(r => `<div style="padding-left:8px;">${r.name}: ${formatCheckResultLine(r)}</div>`).join('');
    return `
      <div style="padding:6px 0; border-bottom:1px dashed #222; font-size:13px;">
        <span style="color:#555; font-size:10px;">${new Date(entry.timestamp).toLocaleTimeString()}</span>
        <span style="color:#888;"> ${whatLabel} — ${tierLabel}</span>${hiddenTag}
        ${resultsHtml}
        ${revealBtn}
      </div>`;
  }).join('');

  return `
    <div class="dashboard-container" style="display:block; max-width:700px; margin:0 auto;">
      <h2 style="color:var(--pip-green);">🎲 DIFFICULTY CHECKS</h2>
      ${playerPanelHtml}
      ${gmPanelHtml}
      <div class="panel">
        <h2>CHECK LOG</h2>
        ${userRole === 'gm' && liveData.last_resolution && (liveData.last_resolution.kind === 'player_check' || liveData.last_resolution.kind === 'gm_check') ? `
        <div style="border:1px solid orange; padding:8px; margin-bottom:10px;">
          <div style="font-size:11px; color:orange;">LAST CHECK: ${liveData.last_resolution.actor} (rolled ${liveData.last_resolution.roll})</div>
          <button style="width:100%; margin-top:6px; padding:6px; background:orange; color:black; font-weight:bold; border:none; cursor:pointer;" onclick="window.gmRerollLastResolution()">↻ REROLL (GM ONLY)</button>
        </div>` : ''}
        <div style="max-height:500px; overflow-y:auto;">${checkLogHtml || '<span style="color:#555;">No checks rolled yet.</span>'}</div>
      </div>
    </div>
  `;
}

// --- DATA LOGS ---
// Job 5 (SCOPE_DECISIONS.md "People tab" ruling: "People notes are
// browsed inside the Data Logs tab — the one place players go to learn,
// read, or refresh their memory"): people.js's peopleDatabase (generated
// by sync-obsidian.js from People/ notes, GM blocks stripped) is folded
// into the SAME tree as data logs here, each person carrying its own
// `category_path` rooted at "People" (see sync-obsidian.js) so it shows
// up as one more top-level folder alongside the vault-folder-derived
// data log categories — not a separate tab. Unlock/read state is its own
// pair of character fields (unlocked_people/read_people), mirroring
// unlocked_logs/read_logs exactly (see gmGrantPerson/openPerson,
// controllers.js). `entry.type` ('data_log' vs 'person') tells
// renderEntry which row/detail styling and controller pair to use.
export function getDataLogsView(liveData, userRole, currentUser) {
  const allLogs = Object.values(dataLogDatabase);
  const allPeople = Object.values(peopleDatabase);
  const players = Object.entries(liveData.characters || {}).filter(([, c]) => c.is_finalized);

  if (userRole === 'gm') {
    const renderLog = (log) => `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px dashed #222; padding:5px 0;">
        <span>${log.name}</span>
        <div style="display:flex; gap:4px;">
          <select id="grantLogTarget_${log.id}" style="background:black; color:lime; border:1px solid #333; font-size:11px;">
            <option value="all">ALL PLAYERS</option>
            ${players.map(([id, c]) => `<option value="${id}">${c.name}</option>`).join('')}
          </select>
          <button class="gm-btn" style="padding:0 8px; font-size:11px;" onclick="window.gmGrantDataLog('${log.id}', document.getElementById('grantLogTarget_${log.id}').value)">GRANT</button>
        </div>
      </div>`;
    const renderPerson = (person) => `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px dashed #222; padding:5px 0;">
        <span>${person.name}</span>
        <div style="display:flex; gap:4px;">
          <select id="grantPersonTarget_${person.id}" style="background:black; color:orange; border:1px solid #333; font-size:11px;">
            <option value="all">ALL PLAYERS</option>
            ${players.map(([id, c]) => `<option value="${id}">${c.name}</option>`).join('')}
          </select>
          <button class="gm-btn" style="padding:0 8px; font-size:11px; border-color:orange; color:orange;" onclick="window.gmGrantPerson('${person.id}', document.getElementById('grantPersonTarget_${person.id}').value)">REVEAL</button>
        </div>
      </div>`;
    const renderEntry = (entry) => entry.type === 'person' ? renderPerson(entry) : renderLog(entry);
    const allEntries = [...allLogs, ...allPeople];
    return `
      <div class="dashboard-container" style="display:block; max-width:700px; margin:0 auto; padding-top:10px;">
        <div class="panel">
          <h2>DATA LOGS — GM VIEW</h2>
          <p style="font-size:12px; color:#666;">You see everything unconditionally. Grant a log, or reveal a person, to a player (or everyone).</p>
          ${allEntries.length > 0 ? renderCategoryTree(buildCategoryTree(allEntries), renderEntry) : '<p style="color:#555;">No data logs authored yet.</p>'}
        </div>
      </div>`;
  }

  const char = liveData.characters[currentUser];
  const unlockedLogs = new Set(char.unlocked_logs || []);
  const readLogs = new Set(char.read_logs || []);
  const unlockedPeople = new Set(char.unlocked_people || []);
  const readPeople = new Set(char.read_people || []);
  const visibleLogs = allLogs.filter(l => unlockedLogs.has(l.id));
  const visiblePeople = allPeople.filter(p => unlockedPeople.has(p.id));
  const openLogId = window.openLogId;
  const openPersonId = window.openPersonId;

  const renderLog = (log) => {
    const isUnread = !readLogs.has(log.id);
    const isOpen = openLogId === log.id;
    return `
      <div>
        <div onclick="window.openDataLog('${log.id}')" style="cursor:pointer; padding:6px 0; border-bottom:1px dashed #222; ${isUnread ? 'font-weight:bold; color:var(--pip-green);' : 'color:#888;'}">
          ${isUnread ? '<span style="color:red;">●</span> ' : ''}${log.name}
        </div>
        ${isOpen ? `<div style="background:rgba(0,50,0,0.2); border:1px solid var(--pip-dim); padding:10px; margin:6px 0; font-size:13px; color:#ccc; white-space:pre-wrap;">${applyGlossaryTooltips(escapeHtml(log.body || ''))}</div>` : ''}
      </div>`;
  };
  // Glossary hover links work the same way as a data log's body (same
  // applyGlossaryTooltips(escapeHtml(...)) call) — a person's own name is
  // already a glossary term too (People/ has always fed the glossary),
  // so linking works both ways with no extra code.
  const renderPerson = (person) => {
    const isUnread = !readPeople.has(person.id);
    const isOpen = openPersonId === person.id;
    return `
      <div>
        <div onclick="window.openPerson('${person.id}')" style="cursor:pointer; padding:6px 0; border-bottom:1px dashed #222; ${isUnread ? 'font-weight:bold; color:orange;' : 'color:#888;'}">
          ${isUnread ? '<span style="color:red;">●</span> ' : ''}${person.name}
        </div>
        ${isOpen ? `<div style="background:rgba(50,30,0,0.15); border:1px solid orange; padding:10px; margin:6px 0; font-size:13px; color:#ccc; white-space:pre-wrap;">${applyGlossaryTooltips(escapeHtml(person.body || ''))}</div>` : ''}
      </div>`;
  };
  const renderEntry = (entry) => entry.type === 'person' ? renderPerson(entry) : renderLog(entry);
  const visibleEntries = [...visibleLogs, ...visiblePeople];

  return `
    <div class="dashboard-container" style="display:block; max-width:700px; margin:0 auto; padding-top:10px;">
      <div class="panel">
        <h2>DATA LOGS</h2>
        ${visibleEntries.length === 0 ? '<p style="color:#555; font-size:13px;">Nothing unlocked yet — your GM will grant you access as the story unfolds.</p>' : renderCategoryTree(buildCategoryTree(visibleEntries), renderEntry)}
      </div>
    </div>`;
}

// --- QUESTS ---
const QUEST_STATUS_COLOR = { active: 'var(--pip-green)', completed: '#4af', failed: '#f55' };
const QUEST_STATUS_LABEL = { active: 'ACTIVE', completed: 'COMPLETED', failed: 'FAILED' };

export function getQuestsView(liveData, userRole, currentUser) {
  const allQuests = Object.values(questDatabase);
  const players = Object.entries(liveData.characters || {}).filter(([, c]) => c.is_finalized);

  if (userRole === 'gm') {
    const openId = window.openQuestId;
    const renderQuest = (quest) => {
      const isOpen = openId === quest.id;
      const holders = players.filter(([, c]) => (c.unlocked_quests || []).includes(quest.id));
      return `
        <div style="border-bottom:1px dashed #222; padding:5px 0;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span onclick="window.openQuest('${quest.id}')" style="cursor:pointer;">${quest.name}</span>
            <div style="display:flex; gap:4px;">
              <select id="grantQuestTarget_${quest.id}" style="background:black; color:lime; border:1px solid #333; font-size:11px;">
                <option value="all">ALL PLAYERS</option>
                ${players.map(([id, c]) => `<option value="${id}">${c.name}</option>`).join('')}
              </select>
              <button class="gm-btn" style="padding:0 8px; font-size:11px;" onclick="window.gmGrantQuest('${quest.id}', document.getElementById('grantQuestTarget_${quest.id}').value)">GRANT</button>
            </div>
          </div>
          ${isOpen ? `
            <div style="background:rgba(0,50,0,0.2); border:1px solid var(--pip-dim); padding:10px; margin:6px 0; font-size:13px;">
              <div style="color:#ccc; white-space:pre-wrap; margin-bottom:8px;">${applyGlossaryTooltips(escapeHtml(quest.body || ''))}</div>
              ${(quest.objectives || []).length > 0 ? `<ol style="margin:0 0 10px 18px; padding:0; color:#aaa; font-size:12px;">${quest.objectives.map(o => `<li>${escapeHtml(o)}</li>`).join('')}</ol>` : ''}
              ${holders.length === 0 ? '<p style="color:#555; font-size:11px;">Not granted to anyone yet.</p>' : `
                <div style="border-top:1px dashed #333; padding-top:6px;">
                  <div style="font-size:11px; color:var(--pip-dim); text-transform:uppercase; margin-bottom:4px;">Status per player</div>
                  ${holders.map(([id, c]) => {
                    const status = (c.quest_status || {})[quest.id] || 'active';
                    return `
                      <div style="display:flex; justify-content:space-between; align-items:center; padding:2px 0;">
                        <span style="font-size:12px;">${c.name}</span>
                        <select id="questStatus_${quest.id}_${id}" style="background:black; color:${QUEST_STATUS_COLOR[status]}; border:1px solid #333; font-size:11px;">
                          ${['active', 'completed', 'failed'].map(s => `<option value="${s}" ${s === status ? 'selected' : ''}>${QUEST_STATUS_LABEL[s]}</option>`).join('')}
                        </select>
                        <button class="gm-btn" style="padding:0 6px; font-size:10px;" onclick="window.gmSetQuestStatus('${quest.id}', '${id}', document.getElementById('questStatus_${quest.id}_${id}').value)">SET</button>
                      </div>`;
                  }).join('')}
                </div>`}
            </div>` : ''}
        </div>`;
    };
    return `
      <div class="dashboard-container" style="display:block; max-width:700px; margin:0 auto; padding-top:10px;">
        <div class="panel">
          <h2>QUESTS — GM VIEW</h2>
          <p style="font-size:12px; color:#666;">Click a title to review it and set status per player. Grant unlocks it for a player (or everyone) — new grants default to Active.</p>
          ${allQuests.length > 0 ? renderCategoryTree(buildCategoryTree(allQuests), renderQuest) : '<p style="color:#555;">No quests authored yet.</p>'}
        </div>
      </div>`;
  }

  const char = liveData.characters[currentUser];
  const unlocked = new Set(char.unlocked_quests || []);
  const readSet = new Set(char.read_quests || []);
  const statusMap = char.quest_status || {};
  const progressMap = char.quest_progress || {};
  const visibleQuests = allQuests.filter(q => unlocked.has(q.id));
  const openId = window.openQuestId;

  const renderQuest = (quest) => {
    const isUnread = !readSet.has(quest.id);
    const isOpen = openId === quest.id;
    const status = statusMap[quest.id] || 'active';
    const completedObjectives = new Set(progressMap[quest.id] || []);
    return `
      <div>
        <div onclick="window.openQuest('${quest.id}')" style="cursor:pointer; padding:6px 0; border-bottom:1px dashed #222; display:flex; justify-content:space-between; align-items:center; ${isUnread ? 'font-weight:bold; color:var(--pip-green);' : 'color:#888;'}">
          <span>${isUnread ? '<span style="color:red;">●</span> ' : ''}${quest.name}</span>
          <span style="font-size:10px; color:${QUEST_STATUS_COLOR[status]};">${QUEST_STATUS_LABEL[status]}</span>
        </div>
        ${isOpen ? `
          <div style="background:rgba(0,50,0,0.2); border:1px solid var(--pip-dim); padding:10px; margin:6px 0; font-size:13px;">
            <div style="color:#ccc; white-space:pre-wrap; margin-bottom:8px;">${applyGlossaryTooltips(escapeHtml(quest.body || ''))}</div>
            ${(quest.objectives || []).length > 0 ? `
              <div style="border-top:1px dashed #333; padding-top:6px;">
                ${quest.objectives.map((o, i) => `
                  <div onclick="event.stopPropagation(); window.toggleQuestObjective('${currentUser}', '${quest.id}', ${i})" style="cursor:pointer; display:flex; gap:6px; align-items:baseline; padding:2px 0; ${completedObjectives.has(i) ? 'color:#666; text-decoration:line-through;' : 'color:#ccc;'}">
                    <span>${completedObjectives.has(i) ? '[X]' : '[ ]'}</span><span style="font-size:12px;">${escapeHtml(o)}</span>
                  </div>`).join('')}
              </div>` : ''}
          </div>` : ''}
      </div>`;
  };

  return `
    <div class="dashboard-container" style="display:block; max-width:700px; margin:0 auto; padding-top:10px;">
      <div class="panel">
        <h2>QUESTS</h2>
        ${visibleQuests.length === 0 ? '<p style="color:#555; font-size:13px;">No quests unlocked yet — your GM will grant them as the story unfolds.</p>' : renderCategoryTree(buildCategoryTree(visibleQuests), renderQuest)}
      </div>
    </div>`;
}

// --- MAPS ---
export function getMapsView(liveData, userRole, currentUser) {
  const allMaps = Object.values(mapDatabase);
  const players = Object.entries(liveData.characters || {}).filter(([, c]) => c.is_finalized);
  const openId = window.openMapId;

  if (userRole === 'gm') {
    const renderMap = (node) => {
      const map = node.entry;
      return `
        <div style="border-bottom:1px dashed #222; padding:5px 0;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span onclick="window.openMap('${map.id}')" style="cursor:pointer;">${map.name}</span>
            <div style="display:flex; gap:4px;">
              <select id="grantMapTarget_${map.id}" style="background:black; color:lime; border:1px solid #333; font-size:11px;">
                <option value="all">ALL PLAYERS</option>
                ${players.map(([id, c]) => `<option value="${id}">${c.name}</option>`).join('')}
              </select>
              <button class="gm-btn" style="padding:0 8px; font-size:11px;" onclick="window.gmGrantMap('${map.id}', document.getElementById('grantMapTarget_${map.id}').value)">GRANT</button>
            </div>
          </div>
          ${openId === map.id ? `<img src="${map.image_url}" style="max-width:100%; border:1px solid var(--pip-dim); margin-top:6px;">` : ''}
          ${node.children.length > 0 ? `<div style="margin-left:16px;">${node.children.map(renderMap).join('')}</div>` : ''}
        </div>`;
    };
    const roots = buildParentTree(allMaps);
    return `
      <div class="dashboard-container" style="display:block; max-width:700px; margin:0 auto; padding-top:10px;">
        <div class="panel">
          <h2>MAPS — GM VIEW</h2>
          <p style="font-size:12px; color:#666;">Click a name to preview it. Grant unlocks it for a player (or everyone).</p>
          ${roots.length > 0 ? roots.map(renderMap).join('') : '<p style="color:#555;">No maps authored yet.</p>'}
        </div>
      </div>`;
  }

  const char = liveData.characters[currentUser];
  const unlocked = new Set(char.unlocked_maps || []);
  const visibleMaps = allMaps.filter(m => unlocked.has(m.id));

  const renderMap = (node) => {
    const map = node.entry;
    const visibleChildren = node.children.filter(c => unlocked.has(c.entry.id));
    return `
      <div style="border-bottom:1px dashed #222; padding:5px 0;">
        <div onclick="window.openMap('${map.id}')" style="cursor:pointer; color:var(--pip-green);">${map.name}</div>
        ${openId === map.id ? `<img src="${map.image_url}" style="max-width:100%; border:1px solid var(--pip-dim); margin-top:6px;">` : ''}
        ${visibleChildren.length > 0 ? `<div style="margin-left:16px;">${visibleChildren.map(renderMap).join('')}</div>` : ''}
      </div>`;
  };
  // Only walk from roots the player can actually see; an unlocked child
  // under a not-yet-unlocked parent still shows at its own top level
  // rather than disappearing.
  const allRoots = buildParentTree(allMaps);
  const visibleRoots = allRoots.filter(n => unlocked.has(n.entry.id));
  const orphanedVisibleChildren = [];
  (function findOrphans(nodes, parentVisible) {
    nodes.forEach(n => {
      const isVisible = unlocked.has(n.entry.id);
      if (isVisible && !parentVisible) orphanedVisibleChildren.push(n);
      findOrphans(n.children, isVisible || parentVisible);
    });
  })(allRoots, false);

  return `
    <div class="dashboard-container" style="display:block; max-width:700px; margin:0 auto; padding-top:10px;">
      <div class="panel">
        <h2>MAPS</h2>
        ${visibleMaps.length === 0 ? '<p style="color:#555; font-size:13px;">No maps unlocked yet.</p>' :
          [...visibleRoots, ...orphanedVisibleChildren].map(renderMap).join('')}
      </div>
    </div>`;
}

// --- MESSAGES ---
export function getMessagesView(liveData, userRole, currentUser) {
  const messages = liveData.messages || [];
  const players = Object.entries(liveData.characters || {}).filter(([, c]) => c.is_finalized);
  const openId = window.openMessageId;

  if (userRole === 'gm') {
    const targetOptions = `<option value="all">ALL PLAYERS</option>${players.map(([id, c]) => `<option value="${id}">${c.name}</option>`).join('')}`;
    const historyHtml = messages.slice().reverse().map(m => `
      <div style="border-bottom:1px dashed #222; padding:6px 0; font-size:13px;">
        <span style="color:#555; font-size:11px;">${new Date(m.timestamp).toLocaleString()}</span>
        <span style="color:cyan;"> → ${m.target === 'all' ? 'ALL' : (liveData.characters[m.target]?.name || m.target)}</span>
        <div style="color:#ccc; margin-top:2px;">${escapeHtml(m.body)}</div>
      </div>`).join('');
    return `
      <div class="dashboard-container" style="grid-template-columns: minmax(260px, 340px) minmax(220px, 1fr);">
        <div class="panel">
          <h2 style="color:cyan;">SEND MESSAGE</h2>
          <label style="font-size:11px; color:#666;">TO</label>
          <select id="messageTarget" style="width:100%; background:black; color:cyan; border:1px solid #333; margin-bottom:8px;">${targetOptions}</select>
          <label style="font-size:11px; color:#666;">MESSAGE</label>
          <textarea id="messageBody" rows="5" style="width:100%; background:black; color:cyan; border:1px solid #333; font-family:'IBM Plex Mono', monospace; margin-bottom:8px;"></textarea>
          <button class="gm-btn" style="width:100%; border-color:cyan; color:cyan;" onclick="window.sendMessage()">SEND</button>
        </div>
        <div class="panel">
          <h2>HISTORY</h2>
          <div style="max-height:500px; overflow-y:auto;">${historyHtml || '<span style="color:#555;">No messages sent yet.</span>'}</div>
        </div>
      </div>`;
  }

  const char = liveData.characters[currentUser];
  const readSet = new Set(char.read_messages || []);
  const myMessages = messages.filter(m => m.target === 'all' || m.target === currentUser);

  const rowsHtml = myMessages.slice().reverse().map(m => {
    const isUnread = !readSet.has(m.id);
    const isOpen = openId === m.id;
    return `
      <div>
        <div onclick="window.openMessage('${m.id}')" style="cursor:pointer; padding:6px 0; border-bottom:1px dashed #222; ${isUnread ? 'font-weight:bold; color:var(--pip-green);' : 'color:#888;'}">
          ${isUnread ? '<span style="color:red;">●</span> ' : ''}${m.target === 'all' ? '[ALL] ' : '[YOU] '}${new Date(m.timestamp).toLocaleDateString()}
        </div>
        ${isOpen ? `<div style="background:rgba(0,50,0,0.2); border:1px solid var(--pip-dim); padding:10px; margin:6px 0; font-size:13px; color:#ccc; white-space:pre-wrap;">${escapeHtml(m.body)}</div>` : ''}
      </div>`;
  }).join('');

  return `
    <div class="dashboard-container" style="display:block; max-width:700px; margin:0 auto; padding-top:10px;">
      <div class="panel">
        <h2>MESSAGES</h2>
        ${myMessages.length === 0 ? '<p style="color:#555; font-size:13px;">No messages yet.</p>' : rowsHtml}
      </div>
    </div>`;
}

// --- PLAYER SCREEN (The Dashboard) ---
export function getPlayerView(charId, liveData) {
  const charData = liveData.characters[charId];
  if (!charData) return `<h1>> ERROR: IDENTITY '${charId.toUpperCase()}' NOT FOUND</h1>`;

  const equip = charData.equipment || { head: null, body: null, right_hand: null, left_hand: null, back: null };

  // PASS RACE + STATUS EFFECTS + EQUIPMENT TO FORMULAS
  const derived = deriveCharacter(charData);

  // --- 1. LEVEL UP & PERKS STATE ---
  const availablePoints = charData.skill_points || 0;
  const draft = window.levelUpDraft || { spent: 0, allocation: {} };
  const pointsRemaining = availablePoints - draft.spent;
  const isLeveling = availablePoints > 0;
  
  // Perks Calculation
  const perksOwned = (charData.perks || []).length;
  const perksAvailable = derived.perksAllowed - perksOwned;

  // --- 2. SKILLS GENERATION ---
  const skillCategories = SKILL_CATEGORIES;
  
  let skillsHtml = "";
  
  if (isLeveling) {
    skillsHtml += `
      <div style="background:var(--pip-dim); color:black; padding:5px; text-align:center; margin-bottom:10px; border:1px solid var(--pip-green);">
        <strong>>> LEVEL UP MODE <<</strong><br>
        POINTS REMAINING: <span style="color:${pointsRemaining > 0 ? 'white' : 'red'}">${pointsRemaining}</span>
        <div style="margin-top:5px; display:flex; gap:10px; justify-content:center;">
           <button onclick="window.confirmLevelUp()" style="background:var(--pip-green); color:black; border:none; cursor:pointer; font-weight:bold;">[CONFIRM]</button>
           <button onclick="window.cancelLevelUp()" style="background:red; color:white; border:none; cursor:pointer;">[RESET]</button>
        </div>
      </div>
    `;
  }

  for (const [category, skillKeys] of Object.entries(skillCategories)) {
    skillsHtml += `<h4 style="color:var(--pip-dim); border-bottom:1px solid var(--pip-dim); margin-top:15px; margin-bottom:5px;">${category}</h4>`;
    skillKeys.forEach(key => {
      if (derived.skills[key] === undefined) return;
      const isTagged = charData.tags ? charData.tags[key] : false;
      const addedSteps = draft.allocation[key] || 0;
      const addedValue = isTagged ? (addedSteps * 2) : addedSteps; 
      
      const baseVal = derived.skills[key]; // ranks + tag bonus already included (deriveCharacter)
      const totalVal = baseVal + addedValue;

      let controls = "";
      if (isLeveling) {
        const minDisabled = addedSteps <= 0 ? "disabled style='opacity:0.3'" : "style='cursor:pointer; color:red;'";
        const maxDisabled = pointsRemaining <= 0 ? "disabled style='opacity:0.3'" : "style='cursor:pointer; color:lime;'";
        controls = `<div style="display:flex; gap:5px;"><button ${minDisabled} onclick="window.adjustSkillDraft('${key}', -1)">[-]</button><button ${maxDisabled} onclick="window.adjustSkillDraft('${key}', 1)">[+]</button></div>`;
      }
      
      const valDisplay = addedValue > 0 ? `<span style="color:cyan;">${totalVal}% (+${addedValue})</span>` : `<span>${totalVal}%</span>`;
      skillsHtml += `<div class="skill-item ${isTagged ? 'tagged' : ''}" style="display:flex; justify-content:space-between; align-items:center;"><span>${renderWikiLink(key.replace(/_/g, ' ').toUpperCase(), SKILL_INFO[key])}</span><div style="display:flex; gap:10px; align-items:center;">${controls}${valDisplay}</div></div>`;
    });
  }

  // --- 3. INVENTORY & WALLET ---
  // Inventory is a stacked { itemId: quantity } map — normalizeInventory
  // also transparently upgrades a character still on the old flat-array
  // shape from before stacking existed, purely for display (nothing gets
  // written back just from viewing).
  let inventoryHtml = "";
  let walletHtml = "";

  // Other finalized party members — the give-item target list. Excludes
  // this character themselves; nothing to give to if nobody else has
  // finished G.O.A.T. registration yet.
  const otherPlayers = Object.entries(liveData.characters || {})
    .filter(([id, c]) => id !== charId && c.is_finalized);

  // Durability system: one row per copy for a weapon/armor item (marks
  // are per-copy, not per-stack), same convention equip/give/repair all
  // key off — the row's own index (position ascending-sorted-by-marks)
  // is what those onclick calls pass back.
  const condition = normalizeCondition(charData);

  if (charData.inventory) {
    const invMap = normalizeInventory(charData.inventory);
    const rawInv = Object.entries(invMap).map(([itemId, qty]) => {
       const itemDef = getItem(itemId);
       return { id: itemId, qty, def: itemDef };
    });

    walletHtml = rawInv.filter(i => i.def && i.def.type === 'currency')
      .map(i => `<div style="display:flex; justify-content:space-between; border-bottom:1px dashed #333; padding:2px 0;">${renderWikiLink(i.def.name, i.def.description)}<span style="color:var(--pip-gold);">x${i.qty}</span></div>`).join("");

    // Renders one <li> for a specific copy (marksIndex is null/omitted for
    // a non-durable, stacked item — qty-based display, unchanged from
    // before the durability system).
    const renderInvRow = (itemDef, itemId, qty, marks, marksIndex) => {
      const isEquipped = marksIndex === null && Object.values(equip).includes(itemId);
      const style = isEquipped ? "opacity: 0.5; border-color: #555;" : "";
      const safeDesc = (itemDef.description || "").replace(/"/g, "&quot;").replace(/'/g, "\\'");
      const qtyTag = (marksIndex === null && qty > 1) ? ` <span style="color:var(--pip-green);">x${qty}</span>` : '';
      const idxArg = marksIndex === null ? '' : `, ${marksIndex}`;
      const broken = marksIndex !== null && isBroken(marks);

      let buttons = "";
      if (!isEquipped) {
        if (broken && itemDef.type === 'weapon') {
          buttons = `<span style="color:var(--danger, #d4574a); font-size:10px;">[BROKEN]</span>`;
        } else if (itemDef.slot === "hand") buttons = `<button onclick="window.equipItem('${itemId}', 'right_hand'${idxArg})">R</button> <button onclick="window.equipItem('${itemId}', 'left_hand'${idxArg})">L</button>`;
        else if (itemDef.slot === "body") buttons = `<button onclick="window.equipItem('${itemId}', 'body'${idxArg})">EQUIP</button>`;
        else if (itemDef.slot === "head") buttons = `<button onclick="window.equipItem('${itemId}', 'head'${idxArg})">EQUIP</button>`;
        else if (itemDef.slot === "back") buttons = `<button onclick="window.equipItem('${itemId}', 'back'${idxArg})">EQUIP</button>`;
        else if (itemDef.type === "consumable") buttons = `<button onclick="window.useItem('${charId}', '${itemId}')">USE</button>`;
      } else { buttons = `<span style="color:var(--pip-green); font-size:10px;">[EQUIPPED]</span>`; }

      // Give-to-party-member — only for unequipped items (equipped gear
      // has to come off first, same as any other inventory action), and
      // only when there's someone else to give it to. §2.1: "Give moves
      // the copy the player picks" — for a durable item that's THIS row's
      // own copy (marksIndex), not an app-chosen default.
      const giveSelectId = `giveTarget_${itemId}${marksIndex === null ? '' : '_' + marksIndex}`;
      const giveControl = (!isEquipped && otherPlayers.length > 0) ? `
        <select id="${giveSelectId}" style="background:black; color:lime; border:1px solid #333; font-size:10px; max-width:70px;">
          ${otherPlayers.map(([id, c]) => `<option value="${id}">${c.name}</option>`).join('')}
        </select>
        <button onclick="window.giveItem('${itemId}', 1, document.getElementById('${giveSelectId}').value${idxArg})">GIVE</button>` : '';

      const meterTag = marksIndex !== null ? `<div style="margin-top:2px;">${conditionMeter(marks)}</div>` : '';

      return `<li class="inv-card" style="${style}"><img src="${itemDef.icon}" class="inv-icon"><div class="inv-info"><span class="inv-name" style="cursor:help; border-bottom:1px dotted var(--pip-green);" onmouseover="window.showTooltip('${safeDesc}', event)" onmouseout="window.hideTooltip()">${itemDef.name}</span>${qtyTag}<span class="inv-meta">${itemDef.type.toUpperCase()}</span>${meterTag}</div><div class="inv-actions">${buttons}${giveControl}</div></li>`;
    };

    inventoryHtml = `<ul class="inventory-list">` + rawInv.filter(i => !i.def || i.def.type !== 'currency').flatMap(i => {
        const itemDef = i.def;
        const itemId = i.id;
        if (!itemDef) return [`<li>${itemId} (DATA SYNC PENDING)</li>`];
        if (isDurable(itemDef)) {
          const marksArr = condition.inv[itemId] || []; // one entry per unequipped copy, same length as i.qty
          return marksArr.map((marks, idx) => renderInvRow(itemDef, itemId, 1, marks, idx));
        }
        return [renderInvRow(itemDef, itemId, i.qty, null, null)];
    }).join("") + `</ul>`;
  }

  const renderSlot = (slotName, slotKey) => {
    const itemId = equip[slotKey];
    const itemDef = getItem(itemId);
    if (itemDef) {
      const meterTag = isDurable(itemDef) ? `<div>${conditionMeter(condition.worn[slotKey])}</div>` : '';
      return `<div class="slot-box occupied" onclick="window.unequipItem('${slotKey}')"><small>${slotName}</small><div style="display:flex; align-items:center; gap:5px;"><img src="${itemDef.icon}" style="width:24px; height:24px; border:1px solid var(--pip-green);"><div><span>${itemDef.name}</span>${meterTag}</div></div></div>`;
    }
    return `<div class="slot-box empty"><small>${slotName}</small><span style="color:#555;">[EMPTY]</span></div>`;
  };

  // --- 4. DAMAGE & WEAPONS ---
  const rHandItem = getItem(equip.right_hand);
  const lHandItem = getItem(equip.left_hand);
  let finalMeleeDmg = derived.meleeDamageBase || 0; 
  let finalRangedDmg = "N/A";

  const checkWeapon = (item) => {
    if (!item || item.type !== 'weapon' || !item.stats) return;
    if (item.stats.range <= 1 || !item.stats.range) {
      const bonus = derived.meleeDamageBase || 0;
      finalMeleeDmg = `${item.stats.dmg} + ${bonus}`;
    } else { finalRangedDmg = item.stats.dmg; }
  };
  checkWeapon(rHandItem);
  checkWeapon(lHandItem);

  // --- 5. TRAITS & PERKS ---
  const traitsHtml = (charData.traits || []).map(tID => { const t = getTrait(tID); return `<div style="margin-bottom:5px;">• ${renderWikiLink(t.name, t.description)}</div>`; }).join("");
  const perksHtml = (charData.perks || []).map(pID => { const p = getTrait(pID); return `<div style="margin-bottom:5px;">• ${renderWikiLink(p.name, p.description)}</div>`; }).join("");
  
  // Perk Alert
  const perkAlert = perksAvailable > 0
    ? `<div style="color:gold; animation: blink 1s infinite; margin-top:5px;">[!] ${perksAvailable} PERK(S) AVAILABLE</div>`
    : "";

  // Perk Selection — the shell works whether the perk library has 0 entries or 50.
  const ownedPerkIds = charData.perks || [];
  const selectablePerks = Object.values(traitDatabase).filter(t => t.type === 'perk' && !ownedPerkIds.includes(t.id));
  const perkSelectionHtml = perksAvailable > 0
    ? (selectablePerks.length > 0
        ? selectablePerks.map(p => `
            <div style="display:flex; justify-content:space-between; align-items:center; border:1px solid var(--pip-dim); padding:6px 8px; margin-top:6px;">
              ${renderWikiLink(p.name, p.description)}
              <button onclick="window.choosePerk('${p.id}')">TAKE</button>
            </div>`).join('')
        : `<div style="color:#555; font-size:12px; margin-top:5px;">No perks authored yet — ask your GM to add some in Obsidian.</div>`)
    : '';

  // Radiation — two-phase per the manual's threshold table. This view is
  // always the player's OWN dashboard (never rendered for the GM looking
  // at someone else), so it deliberately never shows the exact number —
  // only the vague in-character symptom text for their current tier.
  // The GM sees the real count elsewhere (the Squad Monitor character
  // modal), and sets it directly at will rather than it accruing on its own.
  const rads = charData.rads || 0;
  const needs = normalizeNeeds(charData.needs);
  const hungerTier = getNeedTier('hunger', needs.hunger);
  const thirstTier = getNeedTier('thirst', needs.thirst);
  const sleepTier = getNeedTier('sleep', needs.sleep);
  const inCombat = !!(liveData.active_combat && liveData.active_combat.is_active);

  return `
    <div class="dashboard-container">
      <div class="panel">
        <img src="${charData.avatar_url || 'https://placehold.co/200x200/333/white?text=NO+IMG'}" class="char-portrait">
        
        <div style="display:flex; justify-content:space-between; align-items:center; background:var(--pip-green); padding:5px; margin:-10px -10px 10px -10px;">
           <h2 style="margin:0; background:none; color:black;">${charData.name}</h2>
           <span style="color:black; font-weight:bold; font-size:18px;">LVL ${charData.level || 1}</span>
        </div>
        <div style="text-align:right; margin-bottom:10px;">
          <span onclick="window.switchTab('GOAT_REVIEW')" style="cursor:pointer; font-size:11px; color:var(--pip-dim); text-decoration:underline;">[ REVIEW G.O.A.T. RESULTS ]</span>
        </div>
        ${liveData.active_combat && liveData.active_combat.is_active ? `
        <div onclick="window.switchTab('COMBAT')" style="cursor:pointer; text-align:center; padding:8px; margin-bottom:15px; background:rgba(200,0,0,0.15); border:1px solid red; color:red; animation: blink 1s infinite;">
          ⚔ COMBAT IN PROGRESS — TAP TO JOIN
        </div>` : ''}

        <div style="margin-bottom:15px;">
           <label>HP STATUS</label>
           <div style="background:#330000; height:20px; border:1px solid red; margin-top:5px;"><div style="width:${(charData.hp.current / charData.hp.max) * 100}%; background:red; height:100%;"></div></div>
           <div style="text-align:right;">${charData.hp.current} / ${charData.hp.max}</div>
        </div>

        <h3 style="color:var(--pip-dim); border-bottom:1px solid var(--pip-dim); margin-top:5px;">VITALS</h3>
        <div style="margin-bottom:8px;">
          ${renderNeedGauge('HUNGER', needs.hunger, hungerTier)}
          ${renderNeedGauge('THIRST', needs.thirst, thirstTier)}
          ${renderNeedGauge('SLEEP', needs.sleep, sleepTier)}
          ${renderRadiationGauge(rads)}
        </div>

        <div style="border:1px solid var(--pip-dim); padding:8px; margin-bottom:15px;">
          <div style="font-size:11px; color:#888; margin-bottom:6px;">Healing Rate: <span style="color:var(--pip-green);">${derived.healingRate}</span> per full 6h resting &mdash; &times;2 declared, &times;4 at a proper place of rest.</div>
          ${inCombat
            ? `<div style="font-size:11px; color:#888; text-align:center;">CAN'T REST — COMBAT IN PROGRESS</div>`
            : `<div style="display:flex; gap:6px; align-items:center; margin-bottom:6px;">
                 <input type="number" id="restHours" min="0.5" max="24" step="0.5" value="8" style="width:60px; background:black; color:var(--pip-green); border:1px solid var(--pip-dim); font-family:'VT323'; font-size:16px; padding:4px;">
                 <span style="font-size:11px; color:#888; flex-grow:1;">hours &mdash; 6+ restores Sleep</span>
                 <button class="gm-btn" style="border-color:var(--pip-green); color:var(--pip-green);" onclick="window.requestRest(Number(document.getElementById('restHours').value), document.getElementById('restProperPlace').checked)">REST</button>
               </div>
               <label style="font-size:11px; color:#888; display:flex; align-items:center; gap:6px;">
                 <input type="checkbox" id="restProperPlace" style="width:auto;"> at a proper place of rest (bed, inn, infirmary) &mdash; heals &times;4 instead of &times;2
               </label>`}
        </div>

        <div style="display:flex; justify-content:space-between; margin-bottom:15px; border-bottom:1px dashed var(--pip-dim); padding-bottom:5px;">
           <span>VAULT POINTS</span>
           <span style="color:cyan;">${charData.vault_points || 0}</span>
        </div>

        <h3 style="color:var(--pip-dim); border-bottom:1px solid var(--pip-dim); margin-top:20px; display:flex; justify-content:space-between; align-items:center;">
          CONDITION
          <span onclick="window.switchTab('STATUS')" style="cursor:pointer; font-size:11px; font-weight:normal; text-decoration:underline; color:var(--pip-dim);">[ FULL STATUS ]</span>
        </h3>
        <div style="margin-bottom:10px;">${renderConditionRows(buildConditionRows(charData))}</div>

        <h3 style="color:var(--pip-dim); border-bottom:1px solid var(--pip-dim); margin-top:20px;">S.P.E.C.I.A.L.</h3>
        ${SPECIAL_ORDER.map(k => `<div class="special-row"><span>${renderWikiLink(k.toUpperCase(), SPECIAL_INFO[k])}</span><span>${charData.special[k] ?? '-'}</span></div>`).join("")}
        
        <h3 style="color:var(--pip-dim); border-bottom:1px solid var(--pip-dim); margin-top:20px;">TRAITS</h3>
        ${traitsHtml || "> NONE"}
        
        <h3 style="color:var(--pip-dim); border-bottom:1px solid var(--pip-dim); margin-top:20px;">PERKS</h3>
        ${perksHtml || "> NONE"}
        ${perkAlert}
        ${perkSelectionHtml}
      </div>
      
      <div class="panel">
        ${charData.biography ? `
        <h2>BIOGRAPHY</h2>
        <div style="max-height:180px; overflow-y:auto; margin-bottom:20px; font-size:14px; color:#ccc; line-height:1.5; white-space:pre-wrap;">${escapeHtml(charData.biography)}</div>` : ''}

        <h2>MY NOTES</h2>
        <p style="font-size:11px; color:#666; margin:0 0 4px;">Private scratchpad, yours to write — the GM can read it but won't edit it. Separate from your biography above.</p>
        <textarea id="playerNotesTextarea" rows="4" style="width:100%; background:black; color:var(--pip-green); border:1px solid #333; font-family:'IBM Plex Mono', monospace; font-size:12px; margin-bottom:6px;">${escapeHtml(charData.player_notes || '')}</textarea>
        <button class="gm-btn" style="border-color:var(--pip-green); color:var(--pip-green); margin-bottom:20px;" onclick="window.savePlayerNotes()">SAVE NOTES</button>

        <h2>COMBAT STATS</h2>
         <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:20px;">
          <div style="border:1px solid #333; padding:5px; text-align:center;"><small>AC</small><br><strong style="font-size:24px;">${derived.armorClass}</strong></div>
          <div style="border:1px solid #333; padding:5px; text-align:center;"><small>SEQ</small><br><strong style="font-size:24px;">${derived.sequenceBonus}</strong></div>
        </div>
        ${renderCarryWeightGauge(derived.carryUsed, derived.carryCapacity)}
        <h2>SKILLS</h2>
        <div style="flex-grow:1; overflow-y:auto;">${skillsHtml}</div>
      </div>

      <div class="panel">
        <h2>EQUIPPED GEAR</h2>
        <div class="equipment-grid">${renderSlot("HEAD", "head")}${renderSlot("BODY", "body")}${renderSlot("R. HAND", "right_hand")}${renderSlot("L. HAND", "left_hand")}${renderSlot("BACK", "back")}</div>

        <h4 style="color:#555; border-bottom:1px dashed #333; margin-top:15px; margin-bottom:5px;">IMPLANTS <span style="font-size:11px;">(COMING SOON)</span></h4>
        <div class="equipment-grid">
          ${Array.from({ length: derived.implantLimit || 0 }).map(() =>
            `<div class="slot-box empty" style="opacity:0.4; cursor:not-allowed;" title="Implants aren't installable yet — this slot is reserved for you.">
               <small>LOCKED</small><span style="color:#555;">[IMPLANT]</span>
             </div>`
          ).join('')}
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px; border-top:1px solid #333; padding-top:10px;">
          <div style="text-align:center;">
             <small style="color:#aaa;">MELEE DMG</small><br>
             <span style="font-size:18px; color:var(--pip-green);">${finalMeleeDmg}</span>
          </div>
          <div style="text-align:center;">
             <small style="color:#aaa;">RANGED DMG</small><br>
             <span style="font-size:18px; color:var(--pip-green);">${finalRangedDmg}</span>
          </div>
        </div>

        <h2 style="margin-top:20px;">WALLET</h2>
        <div style="margin-bottom:20px;">${walletHtml || "<small style='color:#555;'>EMPTY</small>"}</div>

        <h2>INVENTORY</h2>
        <div style="overflow-y:auto; flex-grow:1;">${inventoryHtml}</div>
      </div>

      <div class="panel">
        <h2>EVENT LOG</h2>
        <p style="font-size:11px; color:#666; margin-top:-4px;">What's happened — the fact of a hidden check, items granted or given, statuses applied, time passing, rests, standing shifting, the party going down. Not the combat log (see COMBAT).</p>
        ${renderEventLog(liveData.event_log, 'player')}
      </div>
    </div>
  `;
}

// Shared by the player's Character Sheet and the GM Dashboard — newest
// first, capped display of the last 100 entries the doc already keeps
// (see eventLog.js's pushEventLog). Player role never sees a 'gm'-only
// entry (none are written yet, but the field is honoured here regardless).
function renderEventLog(log, userRole) {
  const entries = visibleEventLog(log, userRole).slice().reverse();
  if (entries.length === 0) return `<div style="color:#555; font-size:12px;">Nothing logged yet.</div>`;
  return `<div style="max-height:260px; overflow-y:auto;">${entries.map(e => `
    <div style="padding:4px 0; border-bottom:1px dashed #222; font-size:12px;">
      <span style="color:#555; font-size:10px;">${new Date(e.timestamp).toLocaleTimeString()}</span>
      <span style="color:#ccc;"> ${escapeHtml(e.text)}</span>
    </div>`).join('')}</div>`;
}

// --- WORKSHOP (CRAFTING) ---
export function getWorkshopView(charId, liveData) {
  const charData = liveData.characters[charId];
  if (!charData) return `<h1>&gt; ERROR: IDENTITY NOT FOUND</h1>`;
  const inventory = normalizeInventory(charData.inventory);
  const stations = charData.stations || {};

  const derived = deriveCharacter(charData);
  const condition = normalizeCondition(charData);
  const repairSkill = derived.skills.repair || 0;

  // COMPONENTS — every item authored as type:"component", dimmed at 0.
  // Not hardcoded to the 9 ids CRAFTING_SPEC.md proposes, so a newly
  // authored component shows up here the moment it syncs, no code change.
  const components = Object.values(itemDatabase)
    .filter(i => i.type === 'component')
    .sort((a, b) => a.name.localeCompare(b.name));
  const componentsHtml = components.length ? components.map(c => {
    const owned = inventory[c.id] || 0;
    return `
      <div style="display:flex; justify-content:space-between; padding:3px 0; ${owned === 0 ? 'opacity:0.4;' : ''}">
        <span>${renderWikiLink(c.name, c.description)}</span>
        <span style="color:var(--pip-green); font-variant-numeric:tabular-nums;">${owned}</span>
      </div>`;
  }).join('') : `<div style="color:#555; font-size:12px;">No components authored yet.</div>`;

  // STATIONS — field_kit always available; everything else read off
  // characters.<id>.stations, which only the GM's gmGrantStation writes to.
  const stationsHtml = Object.values(STATIONS).map(s => {
    const available = s.always || !!stations[s.id];
    const label = s.always ? 'always' : (stations[s.id] || '[not found]');
    return `
      <div style="display:flex; justify-content:space-between; padding:3px 0; ${available ? '' : 'opacity:0.4;'}">
        <span>${available ? '<span style="color:var(--pip-green);">●</span>' : '<span style="color:#555;">○</span>'} ${renderWikiLink(s.name, s.description)}</span>
        <span style="font-size:12px; color:#aaa;">${label}</span>
      </div>`;
  }).join('');

  // RECIPES — grouped by category, craftable ones sorted above blocked
  // ones within each group. A blocked recipe stays visible and dimmed
  // with every blocking reason shown, never hidden — discovering what
  // you COULD build if you found the parts is half the appeal. Recipes
  // are unlockable (GM ruling 2026-09-24, "granted the way the GM grants
  // data logs") — a character with no unlocked_recipes list at all knows
  // nothing, and the Workshop only ever offers what's actually been
  // taught, never the full authored catalogue.
  const unlockedRecipes = new Set(charData.unlocked_recipes || []);
  const recipes = Object.values(recipeDatabase).filter(r => unlockedRecipes.has(r.id));
  const categoryLabels = { weapons: 'WEAPONS', armour: 'ARMOUR', ammo: 'AMMO', chems: 'CHEMS', food: 'FOOD', gear: 'GEAR' };
  const byCategory = {};
  recipes.forEach(r => {
    const cat = r.category || 'gear';
    (byCategory[cat] = byCategory[cat] || []).push(r);
  });

  const recipesHtml = Object.keys(byCategory).length === 0
    ? `<div style="color:#555; font-size:12px;">No recipes known — your GM will teach you some as the story unfolds.</div>`
    : Object.entries(byCategory).map(([cat, list]) => {
        const scored = list.map(r => ({ r, result: canCraft(r, charData, derived.skills) }))
          .sort((a, b) => (a.result.ok === b.result.ok) ? 0 : (a.result.ok ? -1 : 1));
        const rowsHtml = scored.map(({ r, result }) => {
          const outputItem = getItem(r.produces && r.produces.item);
          const inputsHtml = Object.entries(r.inputs || {}).map(([id, qty]) => {
            const owned = inventory[id] || 0;
            const short = owned < qty;
            const item = getItem(id);
            return `<span style="color:${short ? 'var(--danger, #d4574a)' : 'var(--pip-green)'};">${qty} ${item ? item.name : id}</span>`;
          }).join(' · ');
          return `
            <div style="border:1px solid #222; padding:8px; margin-bottom:6px; ${result.ok ? '' : 'opacity:0.55;'}">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong>${outputItem ? renderWikiLink(outputItem.name, r.description) : r.name}</strong>
                <button class="gm-btn" ${result.ok ? '' : 'disabled'} style="border-color:var(--pip-green); color:var(--pip-green); ${result.ok ? '' : 'opacity:0.5; cursor:not-allowed;'}" onclick="window.craftItem('${r.id}')">CRAFT</button>
              </div>
              <div style="font-size:12px; margin-top:4px;">${inputsHtml}</div>
              ${!result.ok ? `<div style="font-size:11px; color:var(--danger, #d4574a); margin-top:4px;">${result.reasons.join(' — ')}</div>` : ''}
            </div>`;
        }).join('');
        return `<h4 style="color:var(--pip-dim); border-bottom:1px dashed var(--pip-dim); margin-top:14px;">${categoryLabels[cat] || cat.toUpperCase()}</h4>${rowsHtml}`;
      }).join('');

  // SALVAGE — junk currently owned (qty > 0) with an authored
  // scrap_yield, plus every durable weapon/armor owned: either its own
  // authored scrap_yield (exact preview, condition-scaled off its
  // HIGHEST-marks copy — §2.1's stated default, "Scrap and sell take the
  // highest-marks copy") or, per job 4's generic fallback
  // (genericScrapComponent/scrapItem, condition.js/controllers.js), a
  // "1-3 <Component>" RANGE — the real roll is weighted by Repair skill
  // and only happens when SCRAP is actually clicked, so it can't be
  // previewed as one exact number the way an authored yield can.
  const scrappable = Object.keys(inventory)
    .map(id => getItem(id))
    .filter(i => i && inventory[i.id] > 0 && (i.scrap_yield || genericScrapComponent(i)))
    .map(i => ({ item: i, generic: !i.scrap_yield }));
  const salvageHtml = scrappable.length === 0
    ? `<div style="color:#555; font-size:12px;">Nothing to scrap.</div>`
    : scrappable.map(({ item: j, generic }) => {
        const durable = isDurable(j);
        const worstMarks = durable ? Math.max(0, ...(condition.inv[j.id] || [0])) : 0;
        let yieldText, meterTag = durable ? ` — scraps worst copy: ${conditionMeter(worstMarks)}` : '';
        if (generic) {
          const component = genericScrapComponent(j);
          yieldText = component === 'power_armor'
            ? `1 ${(getItem('scrap_electronics') || {}).name || 'Scrap Electronics'} + 1–3 ${(getItem('scrap_metal') || {}).name || 'Scrap Metal'}`
            : `1–3 ${(getItem(component) || {}).name || component}`;
        } else {
          const previewYield = durable ? scrapYieldFor(j.scrap_yield, worstMarks) : j.scrap_yield;
          yieldText = Object.entries(previewYield).map(([id, qty]) => {
            const c = getItem(id);
            return `${qty} ${c ? c.name : id}`;
          }).join(', ');
        }
        return `
          <div style="display:flex; justify-content:space-between; align-items:center; border:1px solid #222; padding:6px 8px; margin-bottom:4px;">
            <div>
              <span>${renderWikiLink(j.name, j.description)} <span style="color:#666; font-size:11px;">x${inventory[j.id]}</span></span>
              <div style="font-size:11px; color:#888;">→ ${yieldText}${meterTag}</div>
            </div>
            <button class="gm-btn" onclick="window.scrapItem('${j.id}')">SCRAP</button>
          </div>`;
      }).join('');

  // REPAIR — every owned durable copy (worn + unequipped), one row each,
  // with the cost/cap shown before confirming (per the brief: "a REPAIR
  // action in the WORKSHOP with the cost and cap shown before confirming").
  const repairRows = [];
  Object.entries(equipLike(charData)).forEach(([slot, itemId]) => {
    if (!itemId) return;
    const item = getItem(itemId);
    if (!isDurable(item)) return;
    repairRows.push({ item, itemId, marks: condition.worn[slot] || 0, slot, index: null });
  });
  Object.entries(condition.inv).forEach(([itemId, marksArr]) => {
    const item = getItem(itemId);
    marksArr.forEach((marks, index) => repairRows.push({ item, itemId, marks, slot: null, index }));
  });
  const repairHtml = repairRows.length === 0
    ? `<div style="color:#555; font-size:12px;">No weapons or armor to repair.</div>`
    : repairRows.sort((a, b) => b.marks - a.marks).map(({ item, itemId, marks, slot, index }) => {
        const benchStationId = item.type === 'weapon' ? 'weapons_bench' : 'armour_bench';
        const atBench = !!stations[benchStationId];
        const floor = repairFloor(repairSkill, atBench);
        const marksToRepair = Math.max(0, marks - floor);
        const cost = totalRepairCost(item, marksToRepair);
        const costText = Object.entries(cost).map(([id, qty]) => {
          const owned = inventory[id] || 0;
          const short = owned < qty;
          const c = getItem(id);
          return `<span style="color:${short ? 'var(--danger, #d4574a)' : 'var(--pip-green)'};">${qty} ${c ? c.name : id}</span>`;
        }).join(' · ') || 'nothing';
        const saveChance = repairSaveChance(repairSkill);
        const canRepair = marksToRepair > 0 && Object.entries(cost).every(([id, qty]) => (inventory[id] || 0) >= qty);
        const argTail = slot !== null ? `'${slot}', null` : `null, ${index}`;
        return `
          <div style="border:1px solid #222; padding:8px; margin-bottom:6px; ${marksToRepair === 0 ? 'opacity:0.55;' : ''}">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <strong>${renderWikiLink(item.name, item.description)}${slot ? ` <span style="color:#666; font-size:11px;">(worn)</span>` : ''}</strong>
              <button class="gm-btn" ${canRepair ? '' : 'disabled'} style="border-color:var(--pip-green); color:var(--pip-green); ${canRepair ? '' : 'opacity:0.5; cursor:not-allowed;'}" onclick="window.repairItem('${itemId}', ${argTail})">REPAIR</button>
            </div>
            <div style="margin-top:4px;">${conditionMeter(marks)}</div>
            ${marksToRepair > 0
              ? `<div style="font-size:12px; margin-top:4px;">Repairs to ${floor} mark${floor === 1 ? '' : 's'}${atBench ? ' (bench)' : ' (field)'} — costs ${costText}${saveChance ? `, ${saveChance}% chance to save the parts` : ''}.</div>`
              : `<div style="font-size:11px; color:#666; margin-top:4px;">Already at the best condition Repair ${repairSkill} allows${atBench ? ' at a bench' : ''}.</div>`}
          </div>`;
      }).join('');

  return `
    <div class="dashboard-container">
      <div class="panel">
        <h2>COMPONENTS</h2>
        <div style="margin-bottom:16px;">${componentsHtml}</div>
        <h2>STATIONS</h2>
        <div>${stationsHtml}</div>
      </div>

      <div class="panel">
        <h2>RECIPES</h2>
        <div style="overflow-y:auto; flex-grow:1;">${recipesHtml}</div>
      </div>

      <div class="panel">
        <h2>REPAIR</h2>
        <p style="font-size:11px; color:#666;">Instant, no roll — capped by your Repair skill (${repairSkill}).</p>
        <div style="overflow-y:auto; flex-grow:1; margin-bottom:16px;">${repairHtml}</div>
        <h2>SALVAGE</h2>
        <p style="font-size:11px; color:#666;">Scrapping is instant and can't be undone.</p>
        <div>${salvageHtml}</div>
      </div>
    </div>
  `;
}

// Equipment map, tolerant of a character doc that predates the equipment
// field existing at all — same default shape the dashboard view uses.
function equipLike(charData) {
  return charData.equipment || { head: null, body: null, right_hand: null, left_hand: null, back: null };
}

// --- GM: character picker shared by the GRANT ITEMS and STATUS tabs ---
// Both tabs act on "whichever character the GM currently has selected" —
// the same window.selectedCharId the MANAGE modal itself uses, so
// picking someone here and opening their modal (or vice versa) always
// agree on who's targeted.
function renderGMCharPicker(chars, color) {
  const options = Object.entries(chars)
    .filter(([, c]) => c.is_finalized)
    .map(([id, c]) => `<option value="${id}" ${window.selectedCharId === id ? 'selected' : ''}>${c.name}</option>`)
    .join('');
  return `
    <div class="panel" style="margin-bottom:15px;">
      <label style="font-size:11px; color:#666;">CHARACTER</label>
      <select onchange="window.setGMStatusTarget(this.value)" style="width:100%; background:black; color:${color}; border:1px solid ${color}; font-family:'VT323'; font-size:16px; padding:4px;">
        <option value="">— choose —</option>${options}
      </select>
    </div>`;
}

// --- GM: GRANT ITEMS (its own tab, GM ruling 2026-09-24 — items grouped
// by category rather than one long select; the MANAGE modal keeps its
// own single-select grant control unchanged alongside this) ---
const GRANT_ITEM_CATEGORIES = [
  ['weapon', 'WEAPONS'], ['armor', 'ARMOR'], ['consumable', 'CONSUMABLES'], ['ammo', 'AMMO'],
  ['component', 'COMPONENTS'], ['junk', 'JUNK'], ['accessory', 'ACCESSORIES'], ['currency', 'CURRENCY']
];
export function getGrantItemsView(liveData) {
  const chars = liveData.characters || {};
  const target = window.selectedCharId;
  const targetChar = target ? chars[target] : null;

  const byCategory = {};
  Object.values(itemDatabase).forEach(item => {
    (byCategory[item.type] = byCategory[item.type] || []).push(item);
  });

  const categoriesHtml = GRANT_ITEM_CATEGORIES.map(([type, label]) => {
    const items = (byCategory[type] || []).sort((a, b) => a.name.localeCompare(b.name));
    if (items.length === 0) return '';
    const rows = items.map(item => `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px dashed #222; padding:4px 0;">
        <span style="font-size:13px;">${renderWikiLink(item.name, item.description)}</span>
        <button class="gm-btn" style="padding:0 8px; font-size:11px;" ${target ? '' : 'disabled'} onclick="window.gmGrantItemToTarget('${item.id}')">GRANT</button>
      </div>`).join('');
    return `<h4 style="color:var(--pip-dim); border-bottom:1px dashed var(--pip-dim); margin-top:14px;">${label}</h4>${rows}`;
  }).join('');

  // RECIPES — granted the way data logs are (GM ruling 2026-09-24): its
  // own per-row target picker (single character or ALL), since a recipe
  // grant makes sense to hand the whole party at once (everyone learns a
  // recipe together from the same book/mentor) in a way a physical item
  // grant doesn't.
  const players = Object.entries(chars).filter(([, c]) => c.is_finalized);
  const recipesHtml = Object.values(recipeDatabase).sort((a, b) => a.name.localeCompare(b.name)).map(r => {
    const alreadyKnownBy = target && targetChar ? (targetChar.unlocked_recipes || []).includes(r.id) : false;
    return `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px dashed #222; padding:5px 0;">
        <span>${r.name}${alreadyKnownBy ? ' <span style="color:#555; font-size:10px;">(known)</span>' : ''}</span>
        <div style="display:flex; gap:4px;">
          <select id="grantRecipeTarget_${r.id}" style="background:black; color:lime; border:1px solid #333; font-size:11px;">
            <option value="all">ALL PLAYERS</option>
            ${players.map(([id, c]) => `<option value="${id}" ${target === id ? 'selected' : ''}>${c.name}</option>`).join('')}
          </select>
          <button class="gm-btn" style="padding:0 8px; font-size:11px;" onclick="window.gmGrantRecipe('${r.id}', document.getElementById('grantRecipeTarget_${r.id}').value)">GRANT</button>
        </div>
      </div>`;
  }).join('') || `<div style="color:#555; font-size:12px;">No recipes authored yet.</div>`;

  return `
    <div class="dashboard-container">
      ${renderGMCharPicker(chars, 'lime')}
      <div class="panel">
        <h2>GRANT ITEMS</h2>
        ${target ? '' : `<p style="font-size:11px; color:#888;">Pick a character above to grant them items.</p>`}
        <div style="overflow-y:auto; flex-grow:1;">${categoriesHtml}</div>
      </div>
      <div class="panel">
        <h2>RECIPES</h2>
        <p style="font-size:11px; color:#666;">Recipes are unlockable — the Workshop only offers what a character's been taught.</p>
        <div style="overflow-y:auto; flex-grow:1;">${recipesHtml}</div>
      </div>
    </div>`;
}

// --- GM: STATUS (its own tab, GM ruling 2026-09-24 — needs, radiation,
// karma and limb damage moved out of the MANAGE modal, plus TIME CONTROL
// moved off the Dashboard) ---
export function getGMStatusView(liveData) {
  const chars = liveData.characters || {};
  const target = window.selectedCharId;
  const targetChar = target ? chars[target] : null;

  const statusPanelHtml = !targetChar ? `<div class="panel"><p style="color:#888; font-size:12px;">Pick a character above to adjust their status.</p></div>` : `
    <div class="panel">
      <h3 style="color:yellow; border-bottom:1px dashed yellow; margin-top:0;">RADIATION</h3>
      <div style="font-size:12px; color:#aaa; margin-bottom:6px;">
        Exact count (only you see this): <span style="color:yellow; font-weight:bold;">${targetChar.rads || 0} rads</span>
        — <span style="font-style:italic;">${getRadiationTier(targetChar.rads || 0).description}</span>
      </div>
      <div style="display:flex; gap:6px; margin-bottom:10px;">
        <input type="number" id="gmRadInput" min="0" max="1000" placeholder="SET RADS" style="flex-grow:1; background:black; color:yellow; border:1px solid yellow;">
        <button class="gm-btn" style="border-color:yellow; color:yellow;" onclick="window.gmSetRadiation(Number(document.getElementById('gmRadInput').value))">SET</button>
      </div>

      <h3 style="color:var(--pip-green); border-bottom:1px dashed var(--pip-green);">SURVIVAL NEEDS</h3>
      <div style="margin-bottom:10px;">
        ${['hunger', 'thirst', 'sleep'].map(key => {
          const needs = normalizeNeeds(targetChar.needs);
          const val = needs[key];
          const tier = getNeedTier(key, val);
          return `
          <div style="margin-bottom:8px;">
            <div style="display:flex; justify-content:space-between; font-size:11px; color:#aaa;">
              <span>${key.toUpperCase()}</span>
              <span style="color:var(--pip-green);">${Math.round(val)} — ${tier.label}</span>
            </div>
            <input type="range" min="0" max="100" value="${val}" style="width:100%;"
                   oninput="this.nextElementSibling.textContent = this.value"
                   onchange="window.gmSetNeed('${key}', Number(this.value))">
            <span style="display:none;">${Math.round(val)}</span>
          </div>`;
        }).join('')}
      </div>

      <h3 style="color:red; border-bottom:1px dashed red;">LIMB DAMAGE</h3>
      <p style="font-size:10px; color:#666; margin:2px 0 6px;">Direct hit-counter control (STATUS_AND_CRIPPLE_SPEC.md C.3) — sets the raw count only, no auto-cripple. Use the STATUS EFFECTS control in this character's MANAGE modal to actually apply/remove Crippled Arm/Leg.</p>
      <div style="margin-bottom:10px;">
        ${(() => {
          const limbResistance = deriveCharacter(targetChar).limbResistance;
          const limbDamage = targetChar.limb_damage || {};
          return LIMB_PART_KEYS.map(partKey => {
            const bodyPart = BODY_PARTS[partKey];
            const val = limbDamage[partKey] || 0;
            return `
            <div style="margin-bottom:8px;">
              <div style="display:flex; justify-content:space-between; font-size:11px; color:#aaa;">
                <span>${bodyPart.label.toUpperCase()}</span>
                <span style="color:red;">${val} / ${limbResistance}</span>
              </div>
              <input type="range" min="0" max="${limbResistance}" value="${val}" style="width:100%;"
                     oninput="this.nextElementSibling.textContent = this.value"
                     onchange="window.gmSetLimbDamage('${partKey}', Number(this.value))">
              <span style="display:none;">${val}</span>
            </div>`;
          }).join('');
        })()}
      </div>

      <h3 style="color:var(--pip-gold); border-bottom:1px dashed var(--pip-gold);">KARMA</h3>
      <div>
        ${(() => {
          const karmaVal = getKarmaValue(targetChar);
          const karmaTier = getKarmaTier(karmaVal);
          return `
          <div style="display:flex; justify-content:space-between; font-size:11px; color:#aaa;">
            <span>PERSONAL KARMA</span>
            <span style="color:var(--pip-gold);">${karmaVal} — ${karmaTier.name}</span>
          </div>
          <input type="range" min="${KARMA_MIN}" max="${KARMA_MAX}" value="${karmaVal}" style="width:100%;"
                 oninput="this.nextElementSibling.textContent = this.value"
                 onchange="window.gmSetKarma(Number(this.value))">
          <span style="display:none;">${karmaVal}</span>
          <p style="font-size:10px; color:#555; margin:4px 0 0;">Only visible to this player and you. Posts a message to them if the tier changes.</p>`;
        })()}
      </div>
    </div>`;

  return `
    <div class="dashboard-container">
      ${renderGMCharPicker(chars, 'var(--pip-green)')}
      <div class="panel">
        <h3 style="color:var(--pip-green); margin-top:0;">TIME CONTROL</h3>
        <div style="display:flex; gap:4px; margin-bottom:8px;">
          <button class="gm-btn" onclick="window.advanceTime(60, {initiatedBy:'GM'})">+1h</button>
          <button class="gm-btn" onclick="window.advanceTime(240, {initiatedBy:'GM'})">+4h</button>
          <button class="gm-btn" style="border-color:var(--pip-green); color:var(--pip-green);" onclick="window.advanceTime(480, {isRest:true, initiatedBy:'GM'})">+8h REST</button>
          <button class="gm-btn" onclick="window.advanceTime(1440, {initiatedBy:'GM'})">+1 DAY</button>
        </div>
        <div style="display:flex; gap:6px; align-items:center; margin-bottom:6px;">
          <input type="number" id="gmTimeHours" min="0.5" step="0.5" placeholder="HRS" style="width:60px; background:black; color:var(--pip-green); border:1px solid var(--pip-dim); font-family:'VT323'; font-size:16px; padding:4px;">
          <label style="font-size:11px; color:#888; display:flex; align-items:center; gap:4px;">
            <input type="checkbox" id="gmTimeIsRest" style="width:auto;"> rest
          </label>
          <label style="font-size:11px; color:#888; display:flex; align-items:center; gap:4px; flex-grow:1;">
            <input type="checkbox" id="gmTimeIsProperRest" style="width:auto;"> proper place (&times;4 heal)
          </label>
          <button class="gm-btn" onclick="window.gmAdvanceTimeAction()">GO</button>
        </div>
        <p style="font-size:11px; color:#555; margin-bottom:0;">Blocked automatically while combat is active. Healing (Fallout 1/2 Healing Rate) applies once per full 6 hours elapsed — &times;1 normally, &times;2 for a declared rest, &times;4 at a proper place of rest. 6+ hours of rest also restores Sleep.</p>
      </div>
      ${statusPanelHtml}
    </div>`;
}

// --- GM SCREEN ---
export function renderGMScreen(liveData) {
  const chars = liveData.characters || {};
  const accessCodes = liveData.access_codes || {};

  const itemOptions = Object.values(itemDatabase)
    .sort((a,b) => a.name.localeCompare(b.name))
    .map(item => `<option value="${item.id}">${item.name} (${item.type})</option>`)
    .join('');

  const statusEffectOptions = Object.values(statusEffectDatabase)
    .sort((a,b) => a.name.localeCompare(b.name))
    .map(fx => `<option value="${fx.id}">${fx.name}</option>`)
    .join('');

  // Active status effects on the currently-selected GM target, for the modal.
  const targetChar = window.selectedCharId ? chars[window.selectedCharId] : null;
  const activeEffectsHtml = targetChar && (targetChar.status_effects || []).length > 0
    ? targetChar.status_effects.map(fx => `
        <div style="display:flex; justify-content:space-between; align-items:center; border:1px solid #333; padding:4px 8px; margin-bottom:4px;">
          <span>${fx.name}</span>
          <button class="gm-btn" style="border-color:red; color:red; padding:0 6px;" onclick="window.gmRemoveStatusEffect('${fx.id}')">X</button>
        </div>`).join('')
    : `<div style="color:#555; font-size:12px;">No active effects.</div>`;

  const squadHtml = Object.entries(chars).map(([id, char]) => {
    const hpPercent = (char.hp.current / char.hp.max) * 100;
    const vp = char.vault_points || 0;
    
    return `
      <div class="gm-char-card" onclick="window.openGMModal('${id}')" style="cursor:pointer;">
        <img src="${char.avatar_url}" class="gm-avatar">
        <div style="flex-grow:1;">
          <div style="display:flex; justify-content:space-between;">
             <strong style="color:var(--pip-green);">${char.name}</strong>
             <span style="color:var(--pip-gold); font-size:12px;">LVL ${char.level || 1}</span>
          </div>
          <div class="hp-bar-container"><div class="hp-fill" style="width:${hpPercent}%"></div></div>
          <div style="display:flex; justify-content:space-between; font-size:12px;">
             <span>HP: ${char.hp.current}/${char.hp.max}</span>
             <span style="color:cyan;">VP: ${vp}</span>
          </div>
        </div>
      </div>`;
  }).join('');

  const codesHtml = Object.entries(accessCodes).map(([code, data]) => {
    return `<div><small style="color:var(--pip-gold);">${code}</small>: ${data.role} (${data.linked_char || '-'})</div>`;
  }).join('');

  // --- COMBAT SETUP ---
  const combatDraft = window.combatDraft || { monsters: {} };
  window.combatDraft = combatDraft;

  const bestiaryListHtml = Object.values(bestiaryDatabase)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(m => {
      const count = combatDraft.monsters[m.id] || 0;
      return `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:3px 0; border-bottom:1px dashed #222;">
          <span style="font-size:13px;">${m.name}</span>
          <div style="display:flex; align-items:center; gap:6px;">
            <button class="gm-btn" style="padding:0 6px;" onclick="window.adjustCombatDraftMonster('${m.id}', -1)">-</button>
            <span style="width:16px; text-align:center;">${count}</span>
            <button class="gm-btn" style="padding:0 6px;" onclick="window.adjustCombatDraftMonster('${m.id}', 1)">+</button>
          </div>
        </div>`;
    }).join('') || `<div style="color:#555; font-size:12px;">No bestiary entries yet.</div>`;

  // --- REPUTATION (party-wide entity roster + sliders) ---
  const reputationEntities = normalizeReputationEntities(liveData.reputation_entities);
  const reputationRowsHtml = reputationEntities.map(entity => {
    const { value, tier } = getReputationModifiers(entity.id, liveData);
    return `
      <div style="border:1px solid #222; padding:6px 8px; margin-bottom:8px;">
        <div style="display:flex; gap:4px; margin-bottom:4px;">
          <input type="text" id="gmRenameReputationEntity_${entity.id}" value="${escapeHtml(entity.name)}"
                 style="flex-grow:1; background:black; color:var(--pip-green); border:1px solid #333; font-family:'VT323'; font-size:14px; padding:2px 4px;">
          <button class="gm-btn" style="padding:0 6px;" onclick="window.gmRenameReputationEntity('${entity.id}')">SAVE</button>
          <button class="gm-btn" style="border-color:red; color:red; padding:0 6px;" onclick="window.gmRemoveReputationEntity('${entity.id}')">X</button>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:11px; color:#aaa;">
          <span>STANDING</span>
          <span style="color:var(--pip-green);">${value} — ${tier.name}</span>
        </div>
        <input type="range" min="${REPUTATION_MIN}" max="${REPUTATION_MAX}" value="${value}" style="width:100%;"
               oninput="this.nextElementSibling.textContent = this.value"
               onchange="window.gmSetReputation('${entity.id}', Number(this.value))">
        <span style="display:none;">${value}</span>
      </div>`;
  }).join('') || `<div style="color:#555; font-size:12px;">No entities tracked yet.</div>`;

  const activeCombat = liveData.active_combat;
  const combatActionHtml = activeCombat && activeCombat.is_active
    ? `<div style="color:red; margin-bottom:10px; animation: blink 1s infinite;">⚠ COMBAT IN PROGRESS</div>
       <button style="width:100%; padding:10px; cursor:pointer; background:red; color:white; font-weight:bold; border:none;" onclick="window.switchTab('COMBAT')">GO TO COMBAT</button>`
    : `<button style="width:100%; padding:10px; cursor:pointer; background:red; color:white; font-weight:bold; border:none;" onclick="window.startCombat()">START COMBAT</button>`;

  // Open/closed state and the title both live in window state (not just
  // set once via DOM after the fact) so they survive a re-render — every
  // GM action (grant item, apply status, adjust a slider…) writes to
  // Firestore, and the onSnapshot listener re-renders the WHOLE gm screen
  // from scratch afterward, which used to snap this markup back to its
  // default "hidden" class and wipe out whatever openGMModal had set on
  // the live DOM node a moment earlier. Baking both into the template
  // itself means a re-render reproduces the same open/closed state
  // instead of resetting it.
  const modalOpen = !!(window.gmModalOpen && targetChar);
  const modalTitle = targetChar ? ("MANAGING: " + window.selectedCharId.toUpperCase()) : "MANAGING TARGET";

  const modalHtml = `
    <div id="gm-modal" class="modal-overlay ${modalOpen ? '' : 'hidden'}">
      <div class="panel modal-panel" style="max-width:400px; border:2px solid red; background:#110000;">
        <div class="modal-header" style="border-bottom:1px solid red; padding-bottom:8px; margin-bottom:10px;">
          <h2 style="background:none; color:red; margin:0;" id="gm-modal-title">${modalTitle}</h2>
          <button onclick="window.closeGMModal()" style="background:red; color:white; border:none; cursor:pointer; flex-shrink:0;">[CLOSE]</button>
        </div>
        <div class="modal-body">
        <h4 style="color:red; border-bottom:1px dashed red;">VITALS</h4>
        <div style="display:flex; gap:10px; margin-bottom:10px;">
         <button class="gm-btn" onclick="window.gmAdjustHP(-1)">-1 HP</button>
         <button class="gm-btn" onclick="window.gmAdjustHP(1)">+1 HP</button>
          <button class="gm-btn" onclick="window.gmAdjustHP(999)">FULL HEAL</button>
        </div>

        <p style="font-size:11px; color:#888; border:1px dashed #444; padding:6px;">Radiation, survival needs, limb damage and karma moved to the <span onclick="window.switchTab('STATUS')" style="color:var(--pip-green); text-decoration:underline; cursor:pointer;">STATUS tab</span> (pick this character there).</p>

        <h4 style="color:var(--pip-green); border-bottom:1px dashed var(--pip-green);">CRAFTING STATIONS</h4>
        <div style="margin-bottom:10px;">
          ${Object.values(STATIONS).filter(s => !s.always).map(s => {
            const granted = targetChar && targetChar.stations && targetChar.stations[s.id];
            return granted ? `
              <div style="display:flex; justify-content:space-between; align-items:center; padding:3px 0;">
                <span><span style="color:var(--pip-green);">●</span> ${s.name} <span style="color:#888; font-size:11px;">— ${granted}</span></span>
                <button class="gm-btn" style="border-color:red; color:red; padding:0 6px;" onclick="window.gmRevokeStation('${s.id}', window.selectedCharId)">REVOKE</button>
              </div>` : `
              <div style="display:flex; gap:6px; align-items:center; padding:3px 0;">
                <span style="flex-grow:1;"><span style="color:#555;">○</span> ${s.name}</span>
                <input type="text" id="stationLabel_${s.id}" placeholder="location" style="width:90px; background:black; color:var(--pip-green); border:1px solid var(--pip-dim); font-size:11px; padding:2px 4px;">
                <button class="gm-btn" style="padding:0 6px;" onclick="window.gmGrantStation('${s.id}', window.selectedCharId, document.getElementById('stationLabel_${s.id}').value)">GRANT</button>
              </div>`;
          }).join('')}
        </div>

        <h4 style="color:cyan; border-bottom:1px dashed cyan;">REWARDS</h4>
        <div style="display:flex; gap:10px; margin-bottom:10px;">
          <button class="gm-btn" style="border-color:cyan; color:cyan;" onclick="window.gmAdjustVaultPoints(1)">+1 VP</button>
          <button class="gm-btn" style="border-color:cyan; color:cyan;" onclick="window.gmAdjustVaultPoints(-1)">-1 VP</button>
          <button class="gm-btn" style="border-color:gold; color:gold;" onclick="window.gmGrantLevel()">GRANT LEVEL UP</button>
        </div>

        <h4 style="color:orange; border-bottom:1px dashed orange;">STATUS EFFECTS</h4>
        <div style="margin-bottom:6px;">${activeEffectsHtml}</div>
        <div style="display:flex; gap:5px; margin-bottom:6px;">
          <select id="statusEffectSelect" style="flex-grow:1; background:black; color:orange; border:1px solid orange; font-family:'VT323';"
            onchange="document.getElementById('customEffectFields').style.display = this.value === '__custom__' ? 'flex' : 'none';">
            ${statusEffectOptions}
            <option value="__custom__">— CUSTOM (type your own) —</option>
          </select>
          <button class="gm-btn" style="border-color:orange; color:orange;" onclick="window.gmApplyStatusEffect()">APPLY</button>
        </div>
        <div id="customEffectFields" style="display:${statusEffectOptions ? 'none' : 'flex'}; gap:5px; margin-bottom:10px;">
          <input type="text" id="statusEffectCustomName" placeholder="NAME (e.g. Bleeding)" style="width:40%; background:black; color:orange; border:1px solid #333;">
          <input type="text" id="statusEffectCustomModifiers" placeholder="MODIFIERS e.g. special_end:-2, skill_sneak:-10" style="flex-grow:1; background:black; color:orange; border:1px solid #333;">
        </div>

        <h4 style="color:lime; border-bottom:1px dashed lime;">INVENTORY</h4>
        <div style="display:flex; gap:5px; margin-bottom:4px;">
          <select id="gmItemSelect" style="flex-grow:1; background:black; color:lime; border:1px solid lime; font-family:'VT323';">
            ${itemOptions}
          </select>
          <button class="gm-btn" style="border-color:lime; color:lime;" onclick="window.gmGrantItem()">GRANT</button>
        </div>
        <div style="margin-bottom:10px;">
          <label style="font-size:11px; color:#666;">Starting marks (weapon/armor only, 0-10) — blank uses the item's own default:</label>
          <input type="number" id="gmItemMarks" min="0" max="10" step="1" placeholder="0" style="width:50px; background:black; color:lime; border:1px solid #333; font-family:'VT323'; margin-left:6px;">
        </div>
        <div>
          ${['head', 'body', 'right_hand', 'left_hand'].map(slot => {
            const equippedId = targetChar && targetChar.equipment ? targetChar.equipment[slot] : null;
            const equippedItem = getItem(equippedId);
            if (!equippedItem) return '';
            const targetCondition = normalizeCondition(targetChar);
            const durableTag = isDurable(equippedItem) ? `
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:2px;">
                ${conditionMeter(targetCondition.worn[slot])}
                <span>
                  <input type="number" id="gmMarks_${slot}" min="0" max="10" value="${targetCondition.worn[slot] || 0}" style="width:40px; background:black; color:orange; border:1px solid #333; font-family:'VT323';">
                  <button class="gm-btn" style="border-color:orange; color:orange; padding:0 6px;" onclick="window.gmSetItemCondition('${equippedId}', '${slot}', null, document.getElementById('gmMarks_${slot}').value)">SET</button>
                </span>
              </div>` : '';
            return `<div style="border:1px solid #333; padding:3px 8px; margin-bottom:4px; font-size:13px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span>${slot.replace('_', ' ').toUpperCase()}: ${equippedItem.name}</span>
                <button class="gm-btn" style="border-color:lime; color:lime; padding:0 8px;" onclick="window.gmUnequipItem('${slot}')">UNEQUIP</button>
              </div>
              ${durableTag}
            </div>`;
          }).join('') || `<div style="color:#555; font-size:12px;">Nothing equipped.</div>`}
        </div>
        ${(() => {
          if (!targetChar) return '';
          const targetCondition = normalizeCondition(targetChar);
          const rows = Object.entries(targetCondition.inv).flatMap(([itemId, marksArr]) => {
            const item = getItem(itemId);
            return marksArr.map((marks, idx) => ({ item, itemId, marks, idx }));
          });
          if (rows.length === 0) return '';
          return `
            <h5 style="color:#888; margin:10px 0 4px;">UNEQUIPPED GEAR CONDITION</h5>
            <div>${rows.map(({ item, itemId, marks, idx }) => `
              <div style="display:flex; justify-content:space-between; align-items:center; border:1px solid #222; padding:2px 8px; margin-bottom:2px; font-size:12px;">
                <span>${item ? item.name : itemId} — ${conditionMeter(marks)}</span>
                <span>
                  <input type="number" id="gmMarks_${itemId}_${idx}" min="0" max="10" value="${marks}" style="width:40px; background:black; color:orange; border:1px solid #333; font-family:'VT323';">
                  <button class="gm-btn" style="border-color:orange; color:orange; padding:0 6px;" onclick="window.gmSetItemCondition('${itemId}', null, ${idx}, document.getElementById('gmMarks_${itemId}_${idx}').value)">SET</button>
                </span>
              </div>`).join('')}</div>`;
        })()}

        <h4 style="color:cyan; border-bottom:1px dashed cyan; margin-top:20px;">BIOGRAPHY &amp; GM NOTES</h4>
        <p style="font-size:11px; color:#666; margin:0 0 4px;">Visible only to this player (and you) — not the rest of the party.</p>
        <label style="font-size:11px; color:#666;">BIOGRAPHY</label>
        <textarea id="bioTextarea" rows="6" style="width:100%; background:black; color:cyan; border:1px solid #333; font-family:'IBM Plex Mono', monospace; font-size:12px; margin-bottom:8px;">${(targetChar && targetChar.biography) || ''}</textarea>
        <label style="font-size:11px; color:#666;">GM NOTES</label>
        <textarea id="gmNotesTextarea" rows="6" style="width:100%; background:black; color:cyan; border:1px solid #333; font-family:'IBM Plex Mono', monospace; font-size:12px; margin-bottom:8px;">${(targetChar && targetChar.gm_notes) || ''}</textarea>
        <button class="gm-btn" style="width:100%; border-color:cyan; color:cyan;" onclick="window.gmSaveBiography()">SAVE</button>

        <label style="font-size:11px; color:#666; display:block; margin-top:10px;">PLAYER'S OWN NOTES (read-only — written by the player, not you)</label>
        <div style="max-height:120px; overflow-y:auto; width:100%; background:#0a0a0a; color:#999; border:1px solid #333; font-family:'IBM Plex Mono', monospace; font-size:12px; padding:6px; white-space:pre-wrap; box-sizing:border-box;">${escapeHtml((targetChar && targetChar.player_notes) || '') || '<span style="color:#555;">(empty)</span>'}</div>

        <h4 style="color:red; border-bottom:1px dashed red; margin-top:20px;">DANGER ZONE</h4>
        <button class="gm-btn" style="border-color:red; color:white; background:red; width:100%;" onclick="window.gmFactoryReset()">FACTORY RESET CHARACTER</button>
        </div>
      </div>
    </div>
  `;

  return `
    <div class="dashboard-container" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">
      ${modalHtml}

      <div class="panel">
        <h2 style="color:var(--pip-gold);">>> GAMEMASTER DASHBOARD</h2>

        <p style="font-size:11px; color:#888; border:1px dashed #444; padding:6px; margin-bottom:14px;">Time control moved to the <span onclick="window.switchTab('STATUS')" style="color:var(--pip-green); text-decoration:underline; cursor:pointer;">STATUS tab</span>.</p>

        <h3>SQUAD MONITOR</h3>
        <p style="font-size:12px; color:#666;">(CLICK CARD TO MANAGE)</p>
        <div class="gm-grid">${squadHtml}</div>
      </div>

      <div class="panel">
        <h3>EVENT LOG</h3>
        <p style="font-size:11px; color:#666; margin-top:-4px;">Everything — including hidden-check rolls and any GM-only entries no player sees.</p>
        ${renderEventLog(liveData.event_log, 'gm')}
      </div>

      <div class="panel">
        <h3>ACCESS CONTROL</h3>
        <div style="margin-bottom:10px; border:1px solid #333; padding:10px; background:rgba(0,0,0,0.5);">
          <small>GRANT NEW ACCESS</small>
          <input type="text" id="newCode" placeholder="CODE" style="width:100%; margin-bottom:5px; background:black; color:lime; border:1px solid #333;">
          <input type="text" id="newCharName" placeholder="CHAR ID (e.g. iron_legs)" style="width:100%; margin-bottom:5px; background:black; color:lime; border:1px solid #333;">
          <input type="text" id="newDisplayName" placeholder="DISPLAY NAME (e.g. Iron Legs) — optional" style="width:100%; margin-bottom:5px; background:black; color:lime; border:1px solid #333;">
          <button style="width:100%; cursor:pointer; background:var(--pip-green); color:black; font-weight:bold;" onclick="window.createAccessCode()">AUTHORIZE</button>
        </div>
        <div style="height:200px; overflow-y:auto; border-top:1px solid #333; padding-top:10px;">
          ${codesHtml}
        </div>
      </div>

      <div class="panel">
        <h3 style="color:red;">COMBAT</h3>
        ${combatActionHtml}
        <p style="font-size:11px; color:#666; margin-top:10px;">Pick enemies for the next encounter:</p>
        <div style="max-height:260px; overflow-y:auto; border-top:1px solid #333; padding-top:6px;">
          ${bestiaryListHtml}
        </div>
      </div>

      <div class="panel">
        <h3 style="color:var(--pip-gold);">REPUTATION</h3>
        <p style="font-size:11px; color:#666; margin-top:-4px;">Party-wide standing (-100..100). A player's karma is set per-character in their MANAGE modal instead.</p>
        <div style="margin-bottom:10px; border:1px solid #333; padding:8px; background:rgba(0,0,0,0.5);">
          <small>TRACK A NEW ENTITY</small>
          <div style="display:flex; gap:5px; margin-top:5px;">
            <input type="text" id="gmNewReputationEntity" placeholder="NAME (e.g. Scrapyard Crew)" style="flex-grow:1; background:black; color:lime; border:1px solid #333;">
            <button class="gm-btn" onclick="window.gmAddReputationEntity()">ADD</button>
          </div>
        </div>
        <div style="max-height:400px; overflow-y:auto;">
          ${reputationRowsHtml}
        </div>
      </div>
    </div>
  `;
}