import set from 'lodash.set';
import { describe, expect, it } from 'vitest';
import { loadFixture, validateSchema } from './test-helpers';

const sectionSchema1 = loadFixture('section-schema-1.json');
const sectionSchema2 = loadFixture('section-schema-2.json');
const sectionSchema3 = loadFixture('section-schema-3.json');
const sectionSchema4 = loadFixture('section-schema-4.json');
const sectionSchema5 = loadFixture('section-schema-5.json');
const sectionSchema6 = loadFixture('section-schema-6.json');
const sectionSettings = loadFixture('section-settings.json');
const emptySchema = '{}';

const validate = validateSchema();

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
    ];
    for (const sectionSchema of schemas) {
      const diagnostics = await validate('sections/section.liquid', sectionSchema);
      expect(diagnostics).toStrictEqual([]);
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
        message: expect.stringContaining('Value is not accepted. Valid values: "article", "blog"'),
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
});
