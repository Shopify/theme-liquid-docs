import { describe, expect, it } from 'vitest';
import { validateSchema } from './test-helpers';

const validate = validateSchema();

const UNSUPPORTED_ICON_MESSAGE =
  'Icon must be one of the supported snake_case stable icon IDs, such as "layout_columns_2". Polaris component names and kebab-case handles aren\'t supported.';
const RADIO_ICON_MESSAGE =
  'The property icon is not allowed on radio options. Use a select setting for options with icons.';
const NOT_DIVISIBLE_MESSAGE = 'Value is not divisible by 0.1.';

const sectionSchema = (setting: any) => ({ name: 'Test', settings: [setting] });

describe('JSON Schema validation of setting option icons and number bounds', () => {
  describe('Unit: select options', () => {
    it('accepts a select option with a supported icon', async () => {
      const diagnostics = await validate(
        'sections/section.liquid',
        sectionSchema({
          type: 'select',
          id: 'layout',
          label: 'Layout',
          options: [{ value: 'two', label: 'Two', icon: 'layout_columns_2' }],
        }),
      );

      expect(diagnostics).toStrictEqual([]);
    });

    it('rejects a select option icon using a Polaris component name', async () => {
      const diagnostics = await validate(
        'sections/section.liquid',
        sectionSchema({
          type: 'select',
          id: 'layout',
          label: 'Layout',
          options: [{ value: 'three', label: 'Three', icon: 'LayoutColumns3Icon' }],
        }),
      );

      expect(diagnostics).toStrictEqual([
        expect.objectContaining({ message: UNSUPPORTED_ICON_MESSAGE }),
      ]);
    });

    it('rejects a select option icon using a kebab-case admin handle', async () => {
      const diagnostics = await validate(
        'sections/section.liquid',
        sectionSchema({
          type: 'select',
          id: 'layout',
          label: 'Layout',
          options: [{ value: 'three', label: 'Three', icon: 'layout-columns-3' }],
        }),
      );

      expect(diagnostics).toStrictEqual([
        expect.objectContaining({ message: UNSUPPORTED_ICON_MESSAGE }),
      ]);
    });
  });

  describe('Unit: radio options', () => {
    it('rejects a radio option with an icon', async () => {
      const diagnostics = await validate(
        'sections/section.liquid',
        sectionSchema({
          type: 'radio',
          id: 'layout',
          label: 'Layout',
          options: [{ value: 'two', label: 'Two', icon: 'layout_columns_2' }],
        }),
      );

      expect(diagnostics).toStrictEqual([expect.objectContaining({ message: RADIO_ICON_MESSAGE })]);
    });
  });

  describe('Unit: number settings', () => {
    it('accepts a number setting with min, max, icon, and options', async () => {
      const diagnostics = await validate(
        'sections/section.liquid',
        sectionSchema({
          type: 'number',
          id: 'columns',
          label: 'Columns',
          default: 8,
          min: 4,
          max: 16,
          icon: 'layout_section',
          options: [
            { value: 4, label: 'Small', icon: 'layout_column_1' },
            { value: 8, label: 'Medium', icon: 'layout_columns_2' },
            { value: 16, label: 'Large', icon: 'layout_columns_3' },
          ],
        }),
      );

      expect(diagnostics).toStrictEqual([]);
    });

    it('accepts a number setting with one-decimal values', async () => {
      const diagnostics = await validate(
        'sections/section.liquid',
        sectionSchema({
          type: 'number',
          id: 'width',
          label: 'Width',
          default: 20.5,
          min: 0.5,
          max: 100.5,
          options: [{ value: 20.5, label: 'Default' }],
        }),
      );

      expect(diagnostics).toStrictEqual([]);
    });

    it('accepts a number setting with values beyond fractional precision', async () => {
      const diagnostics = await validate(
        'sections/section.liquid',
        sectionSchema({
          type: 'number',
          id: 'width',
          label: 'Width',
          default: 1e20,
          min: 0,
          max: 1e20,
        }),
      );

      expect(diagnostics).toStrictEqual([]);
    });

    it('rejects a number setting default with more than one decimal digit', async () => {
      const diagnostics = await validate(
        'sections/section.liquid',
        sectionSchema({ type: 'number', id: 'width', label: 'Width', default: 20.55 }),
      );

      expect(diagnostics).toStrictEqual([
        expect.objectContaining({ message: NOT_DIVISIBLE_MESSAGE }),
      ]);
    });

    it('rejects a number setting min with more than one decimal digit', async () => {
      const diagnostics = await validate(
        'sections/section.liquid',
        sectionSchema({ type: 'number', id: 'width', label: 'Width', min: 0.25 }),
      );

      expect(diagnostics).toStrictEqual([
        expect.objectContaining({ message: NOT_DIVISIBLE_MESSAGE }),
      ]);
    });

    it('rejects a number setting max with more than one decimal digit', async () => {
      const diagnostics = await validate(
        'sections/section.liquid',
        sectionSchema({ type: 'number', id: 'width', label: 'Width', max: 100.75 }),
      );

      expect(diagnostics).toStrictEqual([
        expect.objectContaining({ message: NOT_DIVISIBLE_MESSAGE }),
      ]);
    });

    it('rejects a number option value with more than one decimal digit', async () => {
      const diagnostics = await validate(
        'sections/section.liquid',
        sectionSchema({
          type: 'number',
          id: 'width',
          label: 'Width',
          options: [{ value: 0.333, label: 'Third' }],
        }),
      );

      expect(diagnostics).toStrictEqual([
        expect.objectContaining({ message: NOT_DIVISIBLE_MESSAGE }),
      ]);
    });

    it('rejects a number option value that is a datasource string', async () => {
      const diagnostics = await validate(
        'sections/section.liquid',
        sectionSchema({
          type: 'number',
          id: 'price',
          label: 'Price',
          options: [{ value: 'products.first.price', label: 'First' }],
        }),
      );

      expect(diagnostics).toStrictEqual([
        expect.objectContaining({ message: 'Incorrect type. Expected "number".' }),
      ]);
    });

    it('rejects a number option that is missing a value', async () => {
      const diagnostics = await validate(
        'sections/section.liquid',
        sectionSchema({
          type: 'number',
          id: 'width',
          label: 'Width',
          options: [{ label: 'Medium' }],
        }),
      );

      expect(diagnostics).toStrictEqual([
        expect.objectContaining({ message: 'Missing property "value".' }),
      ]);
    });

    it('rejects a number option with an unknown attribute', async () => {
      const diagnostics = await validate(
        'sections/section.liquid',
        sectionSchema({
          type: 'number',
          id: 'width',
          label: 'Width',
          options: [{ value: 4, bogus: 1 }],
        }),
      );

      expect(diagnostics).toStrictEqual([
        expect.objectContaining({ message: 'Property bogus is not allowed.' }),
      ]);
    });

    it('rejects a number setting icon outside the supported icon list', async () => {
      const diagnostics = await validate(
        'sections/section.liquid',
        sectionSchema({ type: 'number', id: 'width', label: 'Width', icon: 'grid' }),
      );

      expect(diagnostics).toStrictEqual([
        expect.objectContaining({ message: UNSUPPORTED_ICON_MESSAGE }),
      ]);
    });
  });

  describe('Unit: number setting cross-field bounds (enforced by Core, not expressible in JSON Schema)', () => {
    it('accepts a default below min', async () => {
      const diagnostics = await validate(
        'sections/section.liquid',
        sectionSchema({ type: 'number', id: 'width', label: 'Width', default: 2, min: 4, max: 16 }),
      );

      expect(diagnostics).toStrictEqual([]);
    });

    it('accepts a default above max', async () => {
      const diagnostics = await validate(
        'sections/section.liquid',
        sectionSchema({
          type: 'number',
          id: 'width',
          label: 'Width',
          default: 20,
          min: 4,
          max: 16,
        }),
      );

      expect(diagnostics).toStrictEqual([]);
    });

    it('accepts an option value below min', async () => {
      const diagnostics = await validate(
        'sections/section.liquid',
        sectionSchema({
          type: 'number',
          id: 'width',
          label: 'Width',
          min: 4,
          max: 16,
          options: [{ value: 2, label: 'Tiny' }],
        }),
      );

      expect(diagnostics).toStrictEqual([]);
    });

    it('accepts an option value above max', async () => {
      const diagnostics = await validate(
        'sections/section.liquid',
        sectionSchema({
          type: 'number',
          id: 'width',
          label: 'Width',
          min: 4,
          max: 16,
          options: [{ value: 20, label: 'Huge' }],
        }),
      );

      expect(diagnostics).toStrictEqual([]);
    });

    it('accepts a max below min', async () => {
      const diagnostics = await validate(
        'sections/section.liquid',
        sectionSchema({ type: 'number', id: 'width', label: 'Width', min: 16, max: 4 }),
      );

      expect(diagnostics).toStrictEqual([]);
    });
  });
});
