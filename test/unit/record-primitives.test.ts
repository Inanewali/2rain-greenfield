import assert from 'node:assert/strict';
import test from 'node:test';
import {
  actionBar,
  disclosure,
  factGrid,
  isBlankValue,
  panel,
  stack,
} from '../../apps/web/src/record-primitives.js';

test('stack joins present pieces and drops the ones with nothing to show', () => {
  assert.equal(stack('<a>', '', null, undefined, false, '<b>'), '<a><b>');
  assert.equal(stack(), '');
});

test('panel renders its heading, aside, body and attributes', () => {
  assert.equal(
    panel({
      heading: 'Order lines',
      aside: '<a>Help</a>',
      body: '<p>Body</p>',
      className: 'data-panel',
      attributes: { id: 'lines', 'data-empty': true, hidden: false },
    }),
    '<section class="panel data-panel" id="lines" data-empty><div class="panel-heading"><h2>Order lines</h2><a>Help</a></div><p>Body</p></section>',
  );
});

test('panel and factGrid escape the text they are given', () => {
  assert.match(panel({ heading: '<b>', body: '' }), /<h2>&lt;b&gt;<\/h2>/u);
  assert.match(
    factGrid([{ label: 'A&B', value: '"x"' }]),
    /<dt>A&amp;B<\/dt><dd>&quot;x&quot;<\/dd>/u,
  );
});

test('a blank value is missing, whitespace, or the composition dash', () => {
  for (const value of [undefined, null, '', '  ', '—', ' — '])
    assert.equal(isBlankValue(value), true);
  for (const value of ['0', '0.00', 'No limit'])
    assert.equal(isBlankValue(value), false);
});

test('factGrid shows a dash for a blank value and renders nothing with no facts', () => {
  assert.equal(factGrid([]), '');
  assert.equal(
    factGrid([
      { label: 'Notes', value: null, attributes: { 'data-note': true } },
    ]),
    '<dl class="record-fields"><div data-note><dt>Notes</dt><dd>—</dd></div></dl>',
  );
});

test('disclosure and actionBar render nothing without content', () => {
  assert.equal(disclosure({ summary: 'More', body: '' }), '');
  assert.equal(actionBar({ actions: ['', null], label: 'Next step' }), '');
  assert.equal(
    disclosure({ summary: 'More', body: 'x', className: 'more' }),
    '<details class="more"><summary>More</summary>x</details>',
  );
  assert.equal(
    actionBar({ actions: ['<a>', '<b>'], label: 'Next step' }),
    '<div class="command-bar" aria-label="Next step"><a><b></div>',
  );
});
