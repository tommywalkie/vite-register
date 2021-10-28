import { test } from 'uvu';
import * as assert from 'uvu/assert';

test('Can do a couple of math', () => {
  assert.is(1 + 1, 2);
});

test.run();