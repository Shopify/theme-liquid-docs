import { describe, expect, it, beforeEach } from 'vitest';
import set from 'lodash.set';

import translationsSchema from '../schemas/theme/translations_schema.json';
import { validateSchema } from './test-helpers';

import translations1 from './fixtures/translations-1.json';

const emptySchema = {};

const validate = validateSchema([
  {
    uri: 'https://shopify.dev/schemas/translations',
    fileMatch: ['*.json'],
    schema: JSON.stringify(translationsSchema),
  },
]);

describe('JSON Schema validation for translation files', () => {
  it('should evaluate valid translation files expectedly', async () => {
    for (const schema of [emptySchema, translations1]) {
      const diagnostics = await validate(schema);
      expect(diagnostics).toStrictEqual([]);
    }
  });

  it('should refuse arrays', async () => {
    // Using JSON to make a deep copy of one of the valid schemas to mutate safely.
    const schema = JSON.parse(JSON.stringify(translations1));
    set(schema, 'general.foo', []);

    const diagnostics = await validate(schema);
    expect(diagnostics).not.to.be.empty;
    expect(diagnostics).toContainEqual({
      "message": 'Incorrect type. Expected "string".',
      "range": expect.anything(),
      "severity": 1,
    });
  });
});
