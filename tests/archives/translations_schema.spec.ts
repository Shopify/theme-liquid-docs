/**
 * This test is _deprecated_ while we transition away from `ajv`.
 *
 * We should get rid of it once the `ajv` dependency is ripped out of
 * theme-tools, the CLI and the online store code editor.
 */
import { describe, expect, it, beforeEach } from 'vitest';
import set from 'lodash.set';

import jsonSchema from '../../schemas/theme/translations_schema.json';
import { validateSchema } from './legacy-ajv-utilities';

import translations1 from '../fixtures/translations-1.json';

const emptySchema = {};

describe('JSON Schema validation for translation files', () => {
  let validate: any;
  beforeEach(() => {
    validate = validateSchema({
      jsonSchema,
      options: { strictTypes: false },
    });
  });

  it('should evaluate valid translation files expectedly', () => {
    for (const schema of [emptySchema, translations1]) {
      const errors = validate(schema);
      expect(errors).toStrictEqual([]);
    }
  });

  it('should refuse arrays', () => {
    // Using JSON to make a deep copy of one of the valid schemas to mutate safely.
    const schema = JSON.parse(JSON.stringify(translations1));
    set(schema, 'general.foo', []);

    const errors = validate(schema);
    expect(errors).not.to.be.empty;
    expect(errors).toContainEqual({
      instancePath: '/general/foo',
      keyword: 'type',
      message: 'must be string',
      params: {
        type: 'string',
      },
      schemaPath: '#/additionalProperties/anyOf/0/type',
    },
    );
  });
});
