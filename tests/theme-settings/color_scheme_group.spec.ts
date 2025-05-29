import { describe, expect, it } from 'vitest';
import { validateSchema } from '../test-helpers';

const validate = validateSchema();

describe('Module: theme settings validation (config/settings_schema.json)', () => {
  describe('Unit: color_scheme_group', () => {
    const colorSchemeSetting = {
      type: 'color_scheme_group',
      id: 'color_schemes',
      definition: [],
      role: {
        text: 'text',
        background: {
          solid: 'background',
          gradient: 'background_gradient',
        },
        links: 'secondary_button_label',
        icons: 'text',
        primary_button: 'button',
        on_primary_button: 'button_label',
        primary_button_border: 'button',
        secondary_button: 'background',
        on_secondary_button: 'secondary_button_label',
        secondary_button_border: 'secondary_button_label',
      },
    };

    const settings = (override: any) => `[
      {
        "name": "setting category",
        "settings": [
          ${JSON.stringify(Object.assign({}, colorSchemeSetting, override), null, 2)}
        ]
      }
    ]`;

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

    it('validates that the definition are of type header, color, color_background, or color_scheme', async () => {
      const diagnostics = await validate(
        'config/settings_schema.json',
        settings({ definition: [{ type: 'not good' }] }),
      );
      expect(diagnostics).toStrictEqual([
        expect.objectContaining({
          message:
            'Value is not accepted. Valid values: "header", "color", "color_background", "color_scheme".',
        }),
      ]);
    });

    it('validates that the definition are of type header, color, color_background, or color_scheme (extra properties)', async () => {
      const diagnostics = await validate(
        'config/settings_schema.json',
        settings({
          definition: [
            { type: 'header', content: 'ok', headerExtra: 'not allowed' },
            {
              type: 'color',
              id: 'color',
              label: 'my color',
              default: '#000',
              colorExtra: 'not allowed',
            },
            {
              type: 'color_background',
              id: 'color_bg',
              label: 'my color background',
              default: '#000',
              colorBackgroundExtra: 'not allowed',
            },
          ],
        }),
      );
      expect(diagnostics).toStrictEqual([
        expect.objectContaining({
          message: 'Property headerExtra is not allowed.',
        }),
        expect.objectContaining({
          message: 'Property colorExtra is not allowed.',
        }),
        expect.objectContaining({
          message: 'Property colorBackgroundExtra is not allowed.',
        }),
      ]);
    });

    it('validates that conditional settings (visible_if) is not allowed in color_scheme_group', async () => {
      const diagnostics = await validate(
        'config/settings_schema.json',
        settings({ visible_if: '{{ section.settings.show_color_scheme_group }}' }),
      );
      expect(diagnostics).toStrictEqual([
        expect.objectContaining({
          message: 'Property visible_if is not allowed.',
        }),
      ]);
    });

    it('validates that conditional settings (visible if) are allowed in nested definitions within color_scheme_group', async () => {
      const diagnostics = await validate(
        'config/settings_schema.json',
        settings({
          definition: [
            {
              type: 'header',
              content: 'ok',
              visible_if: '{{ section.settings.show_color_scheme_group }}',
            },
            {
              type: 'color',
              id: 'color',
              label: 'my color',
              default: '#000',
              visible_if: '{{ section.settings.show_color_scheme_group }}',
            },
            {
              type: 'color_background',
              id: 'color_bg',
              label: 'my color background',
              default: '#000',
              visible_if: '{{ section.settings.show_color_scheme_group }}',
            },
            {
              type: 'color_scheme',
              id: 'color_scheme',
              label: 'my color scheme',
              default: '#000',
              visible_if: '{{ section.settings.show_color_scheme_group }}',
            },
          ],
        }),
      );

      expect(diagnostics).toStrictEqual([]);
    });
  });
});
