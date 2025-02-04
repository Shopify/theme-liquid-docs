import { assert, describe, expect, it } from 'vitest';
import { SETTINGS_TYPES_NOT_SUPPORTING_VISIBLE_IF } from './test-constants';
import { complete, getService, hover, loadFixture, validateSchema } from './test-helpers';

const themeBlock1 = loadFixture('theme-block-1.json');
const themeBlock2 = loadFixture('theme-block-2.json');
const themeBlockBasics = loadFixture('theme-block-basics.json');
const themeBlockSettings = loadFixture('theme-block-settings.json');
const themeBlocksPresetsAsHash = loadFixture('theme-block-presets-as-hash.json');
const emptySchema = '{}';

const validate = validateSchema();
const service = getService();

describe('JSON Schema validation of Liquid theme block schema tags', () => {
  it('should validate valid block schemas', async () => {
    const schemas = [emptySchema, themeBlock1, themeBlock2, themeBlockBasics, themeBlocksPresetsAsHash];
    for (const blockSchema of schemas) {
      const diagnostics = await validate('blocks/block.liquid', blockSchema);
      expect(diagnostics).toStrictEqual([]);
    }
  });

  it('should report incorrect types', async () => {
    const diagnostics = await validate('blocks/block.liquid', { name: 10 });
    expect(diagnostics).toStrictEqual([
      {
        message: 'Incorrect type. Expected "string".',
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

  it('should accept `@theme` or `@app` blocks', async () => {
    const diagnostics = await validate('blocks/block.liquid', {
      blocks: [{ type: '@app' }, { type: '@theme' }],
    });
    expect(diagnostics).toStrictEqual([]);
  });

  it('should accept specific theme blocks by name', async () => {
    const diagnostics = await validate('blocks/block.liquid', {
      blocks: [{ type: 'slide' }, { type: 'group' }],
    });
    expect(diagnostics).toStrictEqual([]);
  });

  it('should complete the type property with the generic docs', async () => {
    const result = await complete(
      service,
      'blocks/block.liquid',
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
      'blocks/block.liquid',
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
      'blocks/block.liquid',
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

  it('should refuse settings on blocks (local blocks are not a thing)', async () => {
    const diagnostics = await validate('blocks/block.liquid', {
      blocks: [{ type: 'theme', settings: [] }],
    });
    expect(diagnostics).toStrictEqual([
      expect.objectContaining({ message: 'Property settings is not allowed.' }),
    ]);
  });

  it('should require names for presets', async () => {
    const diagnostics = await validate('blocks/block.liquid', {
      presets: [{ settings: {} }],
    });
    expect(diagnostics).toStrictEqual([
      expect.objectContaining({ message: 'Missing property "name".' }),
    ]);
  });

  it('should refuse setting arrays for presets', async () => {
    const diagnostics = await validate('blocks/block.liquid', {
      presets: [{ name: 'my preset', settings: [] }],
    });
    expect(diagnostics).toStrictEqual([
      expect.objectContaining({ message: 'Incorrect type. Expected "object".' }),
    ]);
  });

  it('should accept null tag', async () => {
    const diagnostics = await validate('blocks/block.liquid', { tag: null });
    expect(diagnostics).toStrictEqual([]);
  });

  it('should refuse tag of length > 50', async () => {
    const diagnostics = await validate('blocks/block.liquid', { tag: 'a'.repeat(51) });
    expect(diagnostics).toStrictEqual([
      expect.objectContaining({
        message: 'String is longer than the maximum length of 50.',
      }),
    ]);
  });

  it('should not accept invalid properties', async () => {
    const diagnostics = await validate('blocks/block.liquid', { invalid: 'value' });
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

  it('should properly validate the default values of input settings per setting type', async () => {
    // here we make sure that the input settings rules are working as intended
    const diagnostics = await validate('blocks/block.liquid', themeBlockSettings);
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

  it('should validate theme block with conditional settings', async () => {
    const themeBlockConditionalSettings = loadFixture('theme-block-conditional-settings.json');
    const diagnostics = await validate('blocks/block.liquid', themeBlockConditionalSettings);
    expect(diagnostics).toStrictEqual([]);
  });

  it.each(SETTINGS_TYPES_NOT_SUPPORTING_VISIBLE_IF)('should not allow visible_if on %s setting type', async (settingType) => {
    const schema = {
      settings: [
        {
          type: settingType,
          id: 'test_setting',
          label: 'Test Setting',
          visible_if: '{{ block.settings.some_setting }}'
        }
      ]
    };
    
    const diagnostics = await validate('blocks/block.liquid', schema);
    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        message: 'Property visible_if is not allowed.',
        severity: 1
      })
    );
  });
});
