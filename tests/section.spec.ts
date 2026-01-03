import set from 'lodash.set';
import { assert, describe, expect, it } from 'vitest';
import { INPUT_SETTING_TYPES, SETTINGS_TYPES_NOT_SUPPORTING_VISIBLE_IF } from './test-constants';
import { complete, getService, hover, loadFixture, validateSchema } from './test-helpers';

const sectionSchema1 = loadFixture('section-schema-1.json');
const sectionSchema2 = loadFixture('section-schema-2.json');
const sectionSchema3 = loadFixture('section-schema-3.json');
const sectionSchema4 = loadFixture('section-schema-4.json');
const sectionSchema5 = loadFixture('section-schema-5.json');
const sectionSchema6 = loadFixture('section-schema-6.json');
const sectionSchemaStaticBlockPreset = loadFixture('section-schema-static-block-preset.json');
const sectionSchemaPresetBlocksAsHash = loadFixture('section-schema-preset-blocks-as-hash.json');
const sectionSettings = loadFixture('section-settings.json');
const sectionNestedBlocks = loadFixture('section-nested-blocks.json');
const emptySchema = '{}';

const validate = validateSchema();
const service = getService();

describe('JSON Schema validation of Liquid theme section schema tags', () => {
  it('should validate valid section schemas', async () => {
    const schemas = [
      emptySchema,
      sectionSchema1,
      sectionSchema2,
      sectionSchema3,
      sectionSchema4,
      sectionSchema5,
      sectionSchema6,
      sectionNestedBlocks,
      sectionSchemaPresetBlocksAsHash,
    ];
    for (const sectionSchema of schemas) {
      const diagnostics = await validate('sections/section.liquid', sectionSchema);
      expect(diagnostics, sectionSchema).toStrictEqual([]);
    }
  });

  it('should report incorrect types', async () => {
    // Using JSON to make a deep copy of one of the valid schemas to mutate safely.
    const sectionSchema = JSON.parse(sectionSchema1);
    set(sectionSchema, 'settings.4', 'foobar');

    const diagnostics = await validate('sections/section.liquid', sectionSchema);
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

  it('should report invalid enum values', async () => {
    // Using JSON to make a deep copy of one of the valid schemas to mutate safely.
    const sectionSchema = JSON.parse(sectionSchema1);
    set(sectionSchema, 'settings.6.type', 'foobar');

    const diagnostics = await validate('sections/section.liquid', sectionSchema);
    expect(diagnostics).toStrictEqual([
      {
        code: 1,
        message: expect.stringContaining('Value is not accepted. Valid values: "article", "article_list", "blog"'),
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

  it('should not accept invalid properties', async () => {
    const diagnostics = await validate('sections/section.liquid', { invalid: 'value' });
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
    const diagnostics = await validate('sections/section.liquid', { max_blocks: 0 });
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
    const diagnostics = await validate('sections/section.liquid', { max_blocks: 51 });
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
    const diagnostics = await validate('sections/section.liquid', sectionSchemaStaticBlockPreset);
    expect(diagnostics).toContainEqual({
      message: 'Missing property "id".',
      severity: 1,
      range: expect.objectContaining({
        start: expect.objectContaining({
          line: 33,
        }),
      }),
    });
  });

  it('should properly validate the default values of input settings per setting type', async () => {
    // here we make sure that the input settings rules are working as intended
    const diagnostics = await validate('sections/section.liquid', sectionSettings);
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

  it('should validate section schema with conditional settings', async () => {
    const sectionSchemaConditionalSettings = loadFixture(
      'section-schema-conditional-settings.json',
    );
    const diagnostics = await validate('sections/section.liquid', sectionSchemaConditionalSettings);
    expect(diagnostics).toStrictEqual([]);
  });

  const settingsTypesSupportingVisibleIf = INPUT_SETTING_TYPES.filter(
    (settingType) =>
      !SETTINGS_TYPES_NOT_SUPPORTING_VISIBLE_IF.concat('color_scheme_group').includes(settingType),
  );

  it.each(settingsTypesSupportingVisibleIf)(
    'should allow visible_if on %s setting type',
    async (settingType) => {
      const schema = {
        settings: [
          {
            type: settingType,
            id: 'test_setting',
            label: 'Test Setting',
            visible_if: '{{ section.settings.some_setting }}',
          },
        ],
      };

      const diagnostics = await validate('sections/section.liquid', schema);
      expect(diagnostics).not.toContainEqual(
        expect.objectContaining({
          message: 'Property visible_if is not allowed.',
        }),
      );
    },
  );

  it.each(SETTINGS_TYPES_NOT_SUPPORTING_VISIBLE_IF)(
    'should not allow visible_if on %s setting type',
    async (settingType) => {
      const schema = {
        settings: [
          {
            type: settingType,
            id: 'test_setting',
            label: 'Test Setting',
            visible_if: '{{ section.settings.some_setting }}',
          },
        ],
      };

      const diagnostics = await validate('sections/section.liquid', schema);
      expect(diagnostics).toContainEqual(
        expect.objectContaining({
          message: 'Property visible_if is not allowed.',
          severity: 1,
        }),
      );
    },
  );

  it('should complete the type property with the generic docs', async () => {
    const result = await complete(
      service,
      'sections/section.liquid',
      `{
        "blocks": [
          {
            "type█"
          }
        ]
      }`,
    );

    assert(result);
    expect(result.items).toContainEqual(
      expect.objectContaining({
        documentation: expect.stringContaining('The type of block that can be added to this block'),
      }),
    );
  });

  it('should complete the type value with the specific docs', async () => {
    const result = await complete(
      service,
      'sections/section.liquid',
      `{
        "blocks": [
          {
            "type": "█"
          }
        ]
      }`,
    );

    assert(result);
    // not showing generic docs
    expect(result.items).not.toContainEqual(
      expect.objectContaining({
        documentation: expect.stringContaining('The type of block that can be added to this block'),
      }),
    );
    // show docs for @app and @theme
    expect(result.items).toContainEqual(
      expect.objectContaining({ documentation: expect.stringContaining('@app') }),
    );
    expect(result.items).toContainEqual(
      expect.objectContaining({ documentation: expect.stringContaining('@theme') }),
    );
  });

  it('should hover the type property of a specific block with the specific block docs', async () => {
    const result = await hover(
      service,
      'sections/section.liquid',
      `{
        "blocks": [
          {
            "type": "slide█"
          }
        ]
      }`,
    );

    assert(result);
    // not showing generic docs
    expect(result.contents).toContainEqual(
      expect.stringContaining('found in the `blocks/` folder'),
    );
  });

  it('should hover the type property of a local block with the local block docs', async () => {
    const result = await hover(
      service,
      'sections/section.liquid',
      `{
        "blocks": [
          {
            "type": "slide█",
            "name": "slide"
          }
        ]
      }`,
    );

    assert(result);
    // not showing generic docs
    expect(result.contents).toContainEqual(
      expect.stringContaining('This is a free-form string that you can use as an identifier.'),
    );
  });
});
