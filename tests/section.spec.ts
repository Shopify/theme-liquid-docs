import set from 'lodash.set';
import { describe, expect, it } from 'vitest';

import sectionSchema from '../schemas/theme/section.json';
import { validateSchema } from './test-helpers';

import sectionSchema1 from './fixtures/section-schema-1.json';
import sectionSchema2 from './fixtures/section-schema-2.json';
import sectionSchema3 from './fixtures/section-schema-3.json';
import sectionSchema4 from './fixtures/section-schema-4.json';
import sectionSchema5 from './fixtures/section-schema-5.json';
import sectionSchema6 from './fixtures/section-schema-6.json';

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
const validate = validateSchema([
  {
    uri: 'https://shopify.dev/schemas/section',
    fileMatch: ['*.json'],
    schema: JSON.stringify(sectionSchema),
  },
]);

describe('JSON Schema validation for Theme Liquid Section Schemas', () => {
  it.each([
    emptySchema,
    sectionSchema1,
    sectionSchema2,
    sectionSchema3,
    sectionSchema4,
    sectionSchema5,
    sectionSchema6,
  ])(
    'should evaluate valid section schemas expectedly',
    async (sectionSchema) => {
      const diagnostics = await validate(sectionSchema);
      expect(diagnostics).toStrictEqual([]);
    },
  );

  it('should evaluate invalid settings items correctly', async () => {
    // Using JSON to make a deep copy of one of the valid schemas to mutate safely.
    const sectionSchema = JSON.parse(JSON.stringify(sectionSchema1));
    set(sectionSchema, 'settings.4', 'foobar');

    const diagnostics = await validate(sectionSchema);
    expect(diagnostics).toStrictEqual([
      {
        message: 'Incorrect type. Expected "object".',
        severity: 1,
        range: expect.objectContaining({
          start: expect.objectContaining({
            character: expect.any(Number),
            line: expect.any(Number),
          }),
          end: expect.objectContaining({
            character: expect.any(Number),
            line: expect.any(Number),
          }),
        }),
      },
    ]);
  });

  it('should evaluate invalid settings item type correctly', async () => {
    // Using JSON to make a deep copy of one of the valid schemas to mutate safely.
    const sectionSchema = JSON.parse(JSON.stringify(sectionSchema1));
    set(sectionSchema, 'settings.6.type', 'foobar');

    const diagnostics = await validate(sectionSchema);
    expect(diagnostics).toStrictEqual([
      {
        code: 1,
        message: expect.stringContaining(
          'Value is not accepted. Valid values: "article", "blog"',
        ),
        severity: 1,
        range: expect.objectContaining({
          start: expect.objectContaining({
            character: expect.any(Number),
            line: expect.any(Number),
          }),
          end: expect.objectContaining({
            character: expect.any(Number),
            line: expect.any(Number),
          }),
        }),
      },
    ]);
  });

  it('should not accept invalid section schema values', async () => {
    const diagnostics = await validate({ invalid: 'value' });
    expect(diagnostics).toStrictEqual([
      {
        message: 'Property invalid is not allowed.',
        severity: 1,
        range: expect.objectContaining({
          start: expect.objectContaining({
            character: expect.any(Number),
            line: expect.any(Number),
          }),
          end: expect.objectContaining({
            character: expect.any(Number),
            line: expect.any(Number),
          }),
        }),
      },
    ]);
  });

  it('should properly validate the min value for max_blocks', async () => {
    const diagnostics = await validate({ max_blocks: 0 });
    expect(diagnostics).toStrictEqual([
      {
        message: 'Value is below the minimum of 1.',
        severity: 1,
        range: expect.objectContaining({
          start: expect.objectContaining({
            character: expect.any(Number),
            line: expect.any(Number),
          }),
          end: expect.objectContaining({
            character: expect.any(Number),
            line: expect.any(Number),
          }),
        }),
      },
    ]);
  });

  it('should properly validate the max value for max_blocks', async () => {
    const diagnostics = await validate({ max_blocks: 51 });
    expect(diagnostics).toStrictEqual([
      {
        message: 'Value is above the maximum of 50.',
        severity: 1,
        range: expect.objectContaining({
          start: expect.objectContaining({
            character: expect.any(Number),
            line: expect.any(Number),
          }),
          end: expect.objectContaining({
            character: expect.any(Number),
            line: expect.any(Number),
          }),
        }),
      },
    ]);
  });
});
