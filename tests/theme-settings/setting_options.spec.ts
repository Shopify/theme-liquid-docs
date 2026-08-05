import { describe, expect, it } from 'vitest';
import { validateSchema } from '../test-helpers';

const validate = validateSchema();

const UNSUPPORTED_ICON_MESSAGE =
  'Icon must be one of the supported snake_case stable icon IDs, such as "layout_columns_2". Polaris component names and kebab-case handles aren\'t supported.';
const RADIO_ICON_MESSAGE =
  'The property icon is not allowed on radio options. Use a select setting for options with icons.';

describe('Module: theme settings validation (config/settings_schema.json)', () => {
  describe('Unit: option icons and number bounds', () => {
    it('select setting allows an option icon', async () => {
      const settings = `[
        {
          "name": "some category",
          "settings": [
            {
              "type": "select",
              "id": "layout",
              "label": "Layout",
              "options": [{ "value": "two", "label": "Two", "icon": "layout_columns_2" }]
            }
          ]
        }
      ]`;

      const diagnostics = await validate('config/settings_schema.json', settings);

      expect(diagnostics).toHaveLength(0);
    });

    it('select setting rejects a kebab-case option icon', async () => {
      const settings = `[
        {
          "name": "some category",
          "settings": [
            {
              "type": "select",
              "id": "layout",
              "label": "Layout",
              "options": [{ "value": "three", "label": "Three", "icon": "layout-columns-3" }]
            }
          ]
        }
      ]`;

      const diagnostics = await validate('config/settings_schema.json', settings);

      expect(diagnostics).toStrictEqual([
        expect.objectContaining({ message: UNSUPPORTED_ICON_MESSAGE }),
      ]);
    });

    it('radio setting rejects an option icon', async () => {
      const settings = `[
        {
          "name": "some category",
          "settings": [
            {
              "type": "radio",
              "id": "layout",
              "label": "Layout",
              "options": [{ "value": "two", "label": "Two", "icon": "layout_columns_2" }]
            }
          ]
        }
      ]`;

      const diagnostics = await validate('config/settings_schema.json', settings);

      expect(diagnostics).toStrictEqual([expect.objectContaining({ message: RADIO_ICON_MESSAGE })]);
    });

    it('number setting allows min, max, icon, and options', async () => {
      const settings = `[
        {
          "name": "some category",
          "settings": [
            {
              "type": "number",
              "id": "columns",
              "label": "Columns",
              "default": 8,
              "min": 4,
              "max": 16,
              "icon": "layout_section",
              "options": [
                { "value": 4, "label": "Small", "icon": "layout_column_1" },
                { "value": 8, "label": "Medium", "icon": "layout_columns_2" },
                { "value": 16, "label": "Large", "icon": "layout_columns_3" }
              ]
            }
          ]
        }
      ]`;

      const diagnostics = await validate('config/settings_schema.json', settings);

      expect(diagnostics).toHaveLength(0);
    });

    it('number setting rejects bounds with more than one decimal digit', async () => {
      const settings = `[
        {
          "name": "some category",
          "settings": [
            {
              "type": "number",
              "id": "width",
              "label": "Width",
              "min": 0.25
            }
          ]
        }
      ]`;

      const diagnostics = await validate('config/settings_schema.json', settings);

      expect(diagnostics).toStrictEqual([
        expect.objectContaining({ message: 'Value is not divisible by 0.1.' }),
      ]);
    });
  });
});
