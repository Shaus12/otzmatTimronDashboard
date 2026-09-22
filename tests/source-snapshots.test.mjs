import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseTimewatchSnapshot, localSnapshotsEnabled } from '../lib/integrations/timewatch-schema.ts';
import { parseGmailSnapshot } from '../lib/integrations/gmail-schema.ts';

const attendance = () => ({ version: 1, source: 'timewatch', capturedAt: '2026-01-02T10:00:00Z',
  sourceUpdatedAt: '2026-01-02T09:59:00Z', hoursAccess: 'denied',
  days: [{ date: '2026-01-02', reported: 2, absenceReported: 0, notReported: 3 }] });
const mail = () => ({ version: 1, source: 'gmail', capturedAt: '2026-01-02T10:00:00Z', unreadInbox: 4,
  search: { query: 'invoice', matchedThreads: 10 }, records: [{ id: 'fixture', vendor: 'Test supplier',
    subject: 'Test invoice', date: '2026-01-02', kind: 'invoice', amount: null,
    attachmentCount: null, sourceUrl: 'https://mail.google.com/mail/u/0/#search/invoice', note: 'Unverified amount' }] });

test('private snapshots require explicit development opt-in and are never enabled in production', () => {
  assert.equal(localSnapshotsEnabled({ NODE_ENV: 'development', LOCAL_SOURCE_SNAPSHOTS: '1' }), true);
  for (const env of [{}, { NODE_ENV: 'development' }, { NODE_ENV: 'production', LOCAL_SOURCE_SNAPSHOTS: '1' }]) {
    assert.equal(localSnapshotsEnabled(env), false);
  }
});
test('attendance rejects invalid counts, dates and duplicate days', () => {
  for (const patch of [{ reported: -1 }, { reported: '2' }, { reported: 1.4 }, { date: '2026-02-30' }]) {
    const input = attendance(); Object.assign(input.days[0], patch);
    assert.throws(() => parseTimewatchSnapshot(input));
  }
  const input = attendance(); input.days.push(input.days[0]);
  assert.throws(() => parseTimewatchSnapshot(input));
});
test('attendance preserves zeros and drops unrecognized fields', () => {
  const result = parseTimewatchSnapshot({ ...attendance(), password: 'not-a-real-secret' });
  assert.equal(result.days[0].absenceReported, 0);
  assert.equal('password' in result, false);
});
test('unknown invoice amounts remain null, not zero', () => {
  assert.equal(parseGmailSnapshot(mail()).records[0].amount, null);
});
test('mail rejects unsafe source URLs and duplicate records', () => {
  for (const url of ['javascript:alert(1)', 'https://mail.google.com.evil.example/mail/#test', 'https://example.com/mail/#test', 'https://user:pass@mail.google.com/mail/#test']) {
    const input = mail(); input.records[0].sourceUrl = url;
    assert.throws(() => parseGmailSnapshot(input));
  }
  const input = mail(); input.records.push(input.records[0]);
  assert.throws(() => parseGmailSnapshot(input));
});
test('mail rejects invalid dates and non-finite amounts', () => {
  const input = mail(); input.records[0].date = '2026-02-30';
  assert.throws(() => parseGmailSnapshot(input));
  for (const amount of [-1, Infinity, '123']) {
    const input = mail(); input.records[0].amount = amount;
    assert.throws(() => parseGmailSnapshot(input));
  }
});
