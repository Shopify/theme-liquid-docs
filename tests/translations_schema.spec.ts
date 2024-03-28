import { describe, expect, it, beforeEach } from 'vitest';
import set from 'lodash.set';

import { loadFixture, validateSchema } from './test-helpers';

const translations1 = loadFixture('translations-1.json');
const emptySchema = '{}';
const validate = validateSchema();

describe('JSON Schema validation for translation files', () => {
  it('should evaluate valid translation files expectedly', async () => {
    for (const schema of [emptySchema, translations1]) {
      const diagnostics = await validate('locales/en.json', schema);
      expect(diagnostics).toStrictEqual([]);
    }
  });

  it('should refuse arrays', async () => {
    // Using JSON to make a deep copy of one of the valid schemas to mutate safely.
    const schema = JSON.parse(translations1);
    set(schema, 'general.foo', []);

    const diagnostics = await validate('locales/en.json', JSON.stringify(schema));
    expect(diagnostics).not.to.be.empty;
    expect(diagnostics).toContainEqual({
      message: 'Incorrect type. Expected "string".',
      range: expect.anything(),
      severity: 1,
    });
  });
});
