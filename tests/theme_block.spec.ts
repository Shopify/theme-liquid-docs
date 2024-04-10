import set from 'lodash.set';
import { describe, expect, it } from 'vitest';
import { loadFixture, validateSchema } from './test-helpers';

const themeBlock1 = loadFixture('theme-block-1.json');
const themeBlock2 = loadFixture('theme-block-2.json');
const themeBlockBasics = loadFixture('theme-block-basics.json');
const themeBlockSettings = loadFixture('theme-block-settings.json');
const emptySchema = '{}';

const validate = validateSchema();

describe('JSON Schema validation of Liquid theme block schema tags', () => {
  it('should validate valid block schemas', async () => {
    const schemas = [emptySchema, themeBlock1, themeBlock2, themeBlockBasics];
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

  it('should refuse settings on blocks (local blocks are not a thing)', async () => {
    const diagnostics = await validate('blocks/block.liquid', {
      blocks: [{ type: '@theme', settings: [] }],
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
});
