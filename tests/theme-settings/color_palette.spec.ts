import { describe, expect, it } from 'vitest';
import { validateSchema } from '../test-helpers';

const validate = validateSchema();

describe('Module: theme settings validation (config/settings_schema.json)', () => {
  describe('Unit: color_palette', () => {
    const colorPaletteSetting = {
      type: 'color_palette',
      id: 'color_palette',
      default: {
        background: '#ffffff',
        foreground: '#000000',
      },
    };

    const settings = (override: any) => `[
      {
        "name": "setting category",
        "settings": [
          ${JSON.stringify(Object.assign({}, colorPaletteSetting, override), null, 2)}
        ]
      }
    ]`;

    it('accepts a valid color_palette setting', async () => {
      const diagnostics = await validate('config/settings_schema.json', settings({}));
      expect(diagnostics).toHaveLength(0);
    });

    it('refuses the label property', async () => {
      const diagnostics = await validate(
        'config/settings_schema.json',
        settings({ label: 'uh oh' }),
      );
      expect(diagnostics).toStrictEqual([
        expect.objectContaining({
          message: 'Property label is not allowed.',
        }),
      ]);
    });

    it('refuses the info property', async () => {
      const diagnostics = await validate(
        'config/settings_schema.json',
        settings({ info: 'uh oh' }),
      );
      expect(diagnostics).toStrictEqual([
        expect.objectContaining({
          message: 'Property info is not allowed.',
        }),
      ]);
    });

    it('refuses the visible_if property', async () => {
      const diagnostics = await validate(
        'config/settings_schema.json',
        settings({ visible_if: '{{ section.settings.show_palette }}' }),
      );
      expect(diagnostics).toStrictEqual([
        expect.objectContaining({
          message: 'Property visible_if is not allowed.',
        }),
      ]);
    });

    it('requires the default property', async () => {
      const { default: _, ...settingWithoutDefault } = colorPaletteSetting;
      const json = `[
        {
          "name": "setting category",
          "settings": [
            ${JSON.stringify(settingWithoutDefault, null, 2)}
          ]
        }
      ]`;

      const diagnostics = await validate('config/settings_schema.json', json);

      expect(diagnostics).toStrictEqual([
        expect.objectContaining({
          message: 'Missing property "default".',
        }),
      ]);
    });

    it('requires the id property', async () => {
      const { id: _, ...settingWithoutId } = colorPaletteSetting;
      const json = `[
        {
          "name": "setting category",
          "settings": [
            ${JSON.stringify(settingWithoutId, null, 2)}
          ]
        }
      ]`;

      const diagnostics = await validate('config/settings_schema.json', json);

      expect(diagnostics).toStrictEqual([
        expect.objectContaining({
          message: 'Missing property "id".',
        }),
      ]);
    });

    it('validates that default must be an object', async () => {
      const diagnostics = await validate(
        'config/settings_schema.json',
        settings({ default: '#ffffff' }),
      );
      expect(diagnostics).toStrictEqual([
        expect.objectContaining({
          message: 'Incorrect type. Expected "object".',
        }),
      ]);
    });

    it('validates that default values must be strings', async () => {
      const diagnostics = await validate(
        'config/settings_schema.json',
        settings({ default: { background: 123 } }),
      );
      expect(diagnostics).toStrictEqual([
        expect.objectContaining({
          message: 'Incorrect type. Expected "string".',
        }),
      ]);
    });

    it('refuses default keys with hyphens', async () => {
      const diagnostics = await validate(
        'config/settings_schema.json',
        settings({ default: { 'primary-1': '#fff' } }),
      );
      expect(diagnostics).toStrictEqual([
        expect.objectContaining({
          message: expect.stringMatching(/does not match the pattern of "\^\[a-zA-Z\]\\w\*\$"/),
        }),
      ]);
    });

    it('refuses default keys starting with a digit', async () => {
      const diagnostics = await validate(
        'config/settings_schema.json',
        settings({ default: { '1bad': '#fff' } }),
      );
      expect(diagnostics).toStrictEqual([
        expect.objectContaining({
          message: expect.stringMatching(/does not match the pattern of "\^\[a-zA-Z\]\\w\*\$"/),
        }),
      ]);
    });
  });
});
