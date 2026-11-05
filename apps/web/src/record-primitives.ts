import { escapeHtml } from './html.js';

/**
 * The small pieces a Record page is stacked from. Each one takes plain values,
 * returns one element and knows nothing about surfaces, queries or operations,
 * so a page reads as the list of what it stacks and a piece can be tested alone.
 *
 * A piece given nothing to show returns '', and `stack` drops it. That is what
 * lets a page declare a section without first asking whether it has content.
 *
 * Text is escaped here. `Html` values are already rendered markup: they come
 * from another piece or from a renderer that escapes its own values.
 */
export type Html = string;

type Part = Html | false | null | undefined;
type AttributeValue = string | number | boolean | null | undefined;
export type Attributes = Readonly<Record<string, AttributeValue>>;

/** Renders present attributes. `true` is a bare attribute; false and null drop. */
function renderAttributes(attributes: Attributes): string {
  return Object.entries(attributes)
    .flatMap(([name, value]) => {
      if (value === false || value === null || value === undefined) return [];
      return value === true
        ? [` ${name}`]
        : [` ${name}="${escapeHtml(String(value))}"`];
    })
    .join('');
}

/** Puts pieces one after another, leaving out any that have nothing to show. */
export function stack(...parts: readonly Part[]): Html {
  return parts.filter(Boolean).join('');
}

export interface PanelInput {
  readonly heading: string;
  /** Sits opposite the heading, such as a short explanation or a link. */
  readonly aside?: Html;
  readonly body: Html;
  /** Added to the base `panel` class. */
  readonly className?: string;
  readonly attributes?: Attributes;
}

/** A titled card: the unit a Record page's sections are made of. */
export function panel({
  aside,
  attributes = {},
  body,
  className,
  heading,
}: PanelInput): Html {
  const classes = ['panel', className].filter(Boolean).join(' ');
  return `<section${renderAttributes({ class: classes, ...attributes })}><div class="panel-heading"><h2>${escapeHtml(heading)}</h2>${aside ?? ''}</div>${body}</section>`;
}

export interface Fact {
  readonly label: string;
  /** Plain text, escaped here. A blank value is a fact with nothing to say. */
  readonly value: string | null | undefined;
  readonly attributes?: Attributes;
}

/** No value, or the dash the composition renders for one. */
export function isBlankValue(value: string | null | undefined): boolean {
  const trimmed = value?.trim();
  return !trimmed || trimmed === '—';
}

/** Labelled values in a grid. */
export function factGrid(facts: readonly Fact[]): Html {
  if (!facts.length) return '';
  const rows = facts
    .map(
      ({ attributes = {}, label, value }) =>
        `<div${renderAttributes(attributes)}><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(isBlankValue(value) ? '—' : value!)}</dd></div>`,
    )
    .join('');
  return `<dl class="record-fields">${rows}</dl>`;
}

export interface DisclosureInput {
  readonly summary: string;
  readonly body: Html;
  readonly className?: string;
}

/** Content kept one click away. Nothing to disclose renders nothing. */
export function disclosure({
  body,
  className,
  summary,
}: DisclosureInput): Html {
  if (!body) return '';
  return `<details${renderAttributes({ class: className })}><summary>${escapeHtml(summary)}</summary>${body}</details>`;
}

export interface ActionBarInput {
  /** Rendered controls, in the order they should read. */
  readonly actions: readonly Part[];
  /** What the group is for, for assistive technology. */
  readonly label: string;
}

/** A row of controls. No controls renders no row. */
export function actionBar({ actions, label }: ActionBarInput): Html {
  const body = stack(...actions);
  return body
    ? `<div${renderAttributes({ class: 'command-bar', 'aria-label': label })}>${body}</div>`
    : '';
}
