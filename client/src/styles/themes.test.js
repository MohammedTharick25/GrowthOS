import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const css = readFileSync(fileURLToPath(new URL('./tokens.css', import.meta.url)), 'utf8');
function themeBlock(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`))?.[1];
}
function color(block, token) {
  return block?.match(new RegExp(`${token}:\\s*(#[0-9a-fA-F]{6})`))?.[1];
}
function luminance(hex) {
  const values = hex.slice(1).match(/../g).map((pair) => parseInt(pair, 16) / 255).map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2];
}
function contrast(first, second) {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

test('light and dark theme foreground tokens stay readable against their surfaces', () => {
  const light = themeBlock(':root');
  const dark = themeBlock(":root[data-theme='dark']");
  assert.ok(light && dark, 'both theme token blocks must exist');
  for (const block of [light, dark]) {
    const background = color(block, '--bg');
    for (const foreground of [color(block, '--text'), color(block, '--muted')]) {
      assert.ok(background && foreground);
      assert.ok(contrast(background, foreground) >= 4.5, `${foreground} needs stronger contrast on ${background}`);
    }
  }
});
