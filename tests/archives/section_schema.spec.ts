/**
 * This test is _deprecated_ while we transition away from `ajv`.
 *
 * We should get rid of it once the `ajv` dependency is ripped out of
 * theme-tools, the CLI and the online store code editor.
 */
import { describe, expect, it } from 'vitest';
import set from 'lodash.set';

import jsonSchema from '../../schemas/theme/section_schema.json';
import { validateSchema } from './legacy-ajv-utilities';

import sectionSchema1 from '../fixtures/section-schema-1.json';
import sectionSchema2 from '../fixtures/section-schema-2.json';
import sectionSchema3 from '../fixtures/section-schema-3.json';
import sectionSchema4 from '../fixtures/section-schema-4.json';
import sectionSchema5 from '../fixtures/section-schema-5.json';
import sectionSchema6 from '../fixtures/section-schema-6.json';

const emptySchema = {};
const ALLOWED_SETTING_TYPES = [
  'article',
  'blog',
  'checkbox',
  'collection_list',
  'collection',
  'color_background',
  'color_scheme_group',
  'color_scheme',
  'color',
  'font_picker',
  'header',
  'html',
  'image_picker',
  'inline_richtext',
  'link_list',
  'liquid',
  'number',
  'page',
  'paragraph',
  'product_list',
  'product',
  'radio',
  'range',
  'richtext',
  'select',
  'text',
  'textarea',
  'text_alignment',
  'url',
  'video_url',
  'video',
];
const validate = validateSchema({
  jsonSchema,
  options: { strictTypes: false },
});

describe('JSON Schema validation for Theme Liquid Section Schemas', () => {
  it('should evaluate valid section schemas expectedly', async () => {
    const schemas = [
      emptySchema,
      sectionSchema1,
      sectionSchema2,
      sectionSchema3,
      sectionSchema4,
      sectionSchema5,
      sectionSchema6,
    ];
    for (const sectionSchema of schemas) {
      const errors = validate(sectionSchema);
      expect(errors).toStrictEqual([]);
    }
  });

  it('should evaluate invalid settings items correctly', () => {
    // Using JSON to make a deep copy of one of the valid schemas to mutate safely.
    const sectionSchema = JSON.parse(JSON.stringify(sectionSchema1));
    set(sectionSchema, 'settings.4', 'foobar');

    const errors = validate(sectionSchema);
    expect(errors).toStrictEqual([
      {
        instancePath: '/settings/4',
        keyword: 'type',
        message: 'must be object',
        params: {
          type: 'object',
        },
        schemaPath: '#/definitions/inputSettings/items/type',
      },
    ]);
  });

  it('should evaluate invalid settings item type correctly', () => {
    // Using JSON to make a deep copy of one of the valid schemas to mutate safely.
    const sectionSchema = JSON.parse(JSON.stringify(sectionSchema1));
    set(sectionSchema, 'settings.6.type', 'foobar');

    const errors = validate(sectionSchema);
    expect(errors).toStrictEqual([
      {
        instancePath: '/settings/6/type',
        keyword: 'enum',
        message: 'must be equal to one of the allowed values',
        params: { allowedValues: ALLOWED_SETTING_TYPES },
        schemaPath: '#/definitions/inputSettings/items/properties/type/enum',
      },
    ]);
  });

  it('should not accept invalid section schema values', () => {
    const errors = validate({ invalid: 'value' });
    expect(errors).toStrictEqual([
      {
        instancePath: '',
        keyword: 'additionalProperties',
        message: 'must NOT have additional properties',
        params: { additionalProperty: 'invalid' },
        schemaPath: '#/additionalProperties',
      },
    ]);
  });

  it('should properly validate the min value for max_blocks', () => {
    const errors = validate({ max_blocks: 0 });
    expect(errors).toStrictEqual([
      {
        instancePath: '/max_blocks',
        keyword: 'minimum',
        message: 'must be >= 1',
        params: { comparison: '>=', limit: 1 },
        schemaPath: '#/properties/max_blocks/minimum',
      },
    ]);
  });

  it('should properly validate the max value for max_blocks', () => {
    const errors = validate({ max_blocks: 51 });
    expect(errors).toStrictEqual([
      {
        instancePath: '/max_blocks',
        keyword: 'maximum',
        message: 'must be <= 50',
        params: { comparison: '<=', limit: 50 },
        schemaPath: '#/properties/max_blocks/maximum',
      },
    ]);
  });
});
