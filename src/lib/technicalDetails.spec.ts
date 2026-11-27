import { describe, expect, it } from 'vitest';
import { splitTechnical } from './technicalDetails';

describe('splitTechnical', () => {
  it('leaves a page without the section unchanged', () => {
    const html = '<p>Intro</p><h2 id="status">Status</h2><p>Done.</p>';
    expect(splitTechnical(html)).toEqual({ main: html, technical: null });
  });

  it('moves everything after the heading into the technical part, and drops the heading', () => {
    const html =
      '<p>Intro</p>\n<h2 id="technical-details">Technical details</h2>\n<ul><li>nDCG</li></ul><h2 id="more">More</h2><p>x</p>';
    const { main, technical } = splitTechnical(html);
    expect(main).toBe('<p>Intro</p>\n');
    expect(technical).toBe('\n<ul><li>nDCG</li></ul><h2 id="more">More</h2><p>x</p>');
    expect(technical).not.toContain('Technical details');
  });

  it('matches only the exact id, not a heading that merely contains the words', () => {
    const html = '<h2 id="technical-details-later">Technical details, later</h2><p>x</p>';
    expect(splitTechnical(html).technical).toBeNull();
  });

  it('handles extra attributes and markup inside the heading', () => {
    const html = '<p>a</p><h2 class="x" id="technical-details" data-y="1">Technical <em>details</em></h2><p>b</p>';
    expect(splitTechnical(html)).toEqual({ main: '<p>a</p>', technical: '<p>b</p>' });
  });
});
