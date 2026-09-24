// The wide running event log (GM ruling 2026-09-24) — bounded append and
// per-role visibility, the two pieces of real logic behind it.
import { describe, it, expect } from 'vitest';
import { pushEventLog, visibleEventLog, EVENT_LOG_LIMIT } from '../src/eventLog.js';

describe('pushEventLog', () => {
  it('appends an entry with the given text', () => {
    const log = pushEventLog([], { text: 'GM advances time by 4h.' });
    expect(log).toHaveLength(1);
    expect(log[0].text).toBe('GM advances time by 4h.');
    expect(log[0].visibility).toBe('all');
  });

  it('treats a missing log as empty rather than throwing', () => {
    const log = pushEventLog(undefined, { text: 'first event' });
    expect(log).toHaveLength(1);
  });

  it('fills in an id and timestamp when not given', () => {
    const log = pushEventLog([], { text: 'x' });
    expect(log[0].id).toBeTruthy();
    expect(typeof log[0].timestamp).toBe('number');
  });

  it('keeps only the last EVENT_LOG_LIMIT entries', () => {
    let log = [];
    for (let i = 0; i < EVENT_LOG_LIMIT + 10; i++) {
      log = pushEventLog(log, { text: `event ${i}` });
    }
    expect(log).toHaveLength(EVENT_LOG_LIMIT);
    expect(log[0].text).toBe('event 10'); // the oldest 10 fell off
    expect(log[log.length - 1].text).toBe(`event ${EVENT_LOG_LIMIT + 9}`);
  });

  it('respects an explicit gm-only visibility', () => {
    const log = pushEventLog([], { text: 'secret', visibility: 'gm' });
    expect(log[0].visibility).toBe('gm');
  });
});

describe('visibleEventLog', () => {
  const log = [
    { id: '1', text: 'public event', visibility: 'all' },
    { id: '2', text: 'gm secret', visibility: 'gm' }
  ];

  it('shows a player only the all-visibility entries', () => {
    expect(visibleEventLog(log, 'player').map(e => e.id)).toEqual(['1']);
  });

  it('shows the GM everything', () => {
    expect(visibleEventLog(log, 'gm').map(e => e.id)).toEqual(['1', '2']);
  });

  it('treats a missing log as empty', () => {
    expect(visibleEventLog(undefined, 'gm')).toEqual([]);
  });
});
