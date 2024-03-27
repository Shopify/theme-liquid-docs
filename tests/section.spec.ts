import set from 'lodash.set';
import { describe, expect, it } from 'vitest';

import sectionSchema from '../schemas/theme/section.json';
import { makeLoadSchema, validateSchema } from './test-helpers';

const loadSchema = makeLoadSchema(__dirname);
const sectionSchema1 = loadSchema('./fixtures/section-schema-1.json');
const sectionSchema2 = loadSchema('./fixtures/section-schema-2.json');
const sectionSchema3 = loadSchema('./fixtures/section-schema-3.json');
const sectionSchema4 = loadSchema('./fixtures/section-schema-4.json');
const sectionSchema5 = loadSchema('./fixtures/section-schema-5.json');
const sectionSchema6 = loadSchema('./fixtures/section-schema-6.json');
const sectionSettings = loadSchema('./fixtures/section-settings.json');

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
    const sectionSchema = JSON.parse(sectionSchema1);
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
    const sectionSchema = JSON.parse(sectionSchema1);
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

  it('should properly validate the default values of input settings per setting type', async () => {
    // here we make sure that the input settings rules are working as intended
    const diagnostics = await validate(sectionSettings);
    expect(diagnostics).toContainEqual({
      message: 'Incorrect type. Expected "boolean".',
      severity: 1,
      range: expect.objectContaining({
        start: expect.objectContaining({
          line: 7,
        }),
      }),
    });
    expect(diagnostics).toContainEqual({
      message: 'Incorrect type. Expected "number".',
      severity: 1,
      range: expect.objectContaining({
        start: expect.objectContaining({
          line: 13,
        }),
      }),
    });
    expect(diagnostics).toContainEqual({
      message: 'Incorrect type. Expected "string".',
      severity: 1,
      range: expect.objectContaining({
        start: expect.objectContaining({
          line: 19,
        }),
      }),
    });
    expect(diagnostics).toContainEqual({
      message: 'Missing property "options".',
      severity: 1,
      range: expect.objectContaining({
        start: expect.objectContaining({
          line: 21,
        }),
      }),
    });
    expect(diagnostics).toContainEqual({
      code: 1,
      message: 'Value is not accepted. Valid values: "youtube", "vimeo".',
      severity: 1,
      range: expect.objectContaining({
        start: expect.objectContaining({
          line: 30,
        }),
      }),
    });
  });
});
