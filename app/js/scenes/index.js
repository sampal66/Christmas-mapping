// Show running order. Placeholder scenes until WP-03 adds the real ones.
import testA from './s00-test-a.js';
import testB from './s00-test-b.js';

export const scenes = [testA, testB];

// The live star moment will be a hold point too (scene 9). This one tests the mechanism.
export const holds = [
  { id: 'test-hold', at: 15, loop: [13, 15] },
];
