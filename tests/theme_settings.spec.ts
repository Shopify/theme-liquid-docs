import set from 'lodash.set';
import { assert, describe, expect, it } from 'vitest';
import { complete, getService, hover, loadFixture, validateSchema } from './test-helpers';

const themeSettingsMetadata = loadFixture('theme-settings-metadata.json');
const themeSettingsAllSettings = loadFixture('theme-settings-all-settings.json');
const themeSettingsDawn = loadFixture('theme-settings-dawn.json');

const inputSettingTypes = [
  'checkbox',
  'number',
  'radio',
  'range',
  'select',
  'text',
  'textarea',
  'article',
  'blog',
  'collection',
  'collection_list',
  'color',
  'color_background',
  'color_scheme',
  'color_scheme_group',
  'font_picker',
  'html',
  'image_picker',
  'inline_richtext',
  'link_list',
  'liquid',
  'page',
  'product_list',
  'product',
  'richtext',
  'style.layout_panel',
  'style.size_panel',
  'style.spacing_panel',
  'text_alignment',
  'url',
  'video_url',
  'video',
] as const;

const sidebarSettingTypes = ['header', 'paragraph'] as const;

const validate = validateSchema();
const service = getService();

describe('Module: theme settings validation (config/settings_schema.json)', () => {
  it('validates valid theme settings files', async () => {
    const fixtures = [themeSettingsMetadata, themeSettingsAllSettings, themeSettingsDawn];
    for (const fixture of fixtures) {
      const diagnostics = await validate('config/settings_schema.json', fixture);
      expect(diagnostics).toStrictEqual([]);
    }
  });

  it('rejects objects at the top level', async () => {
    const diagnostics = await validate('config/settings_schema.json', { invalid: 'value' });
    expect(diagnostics).toStrictEqual([
      {
        message: 'Incorrect type. Expected "array".',
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

  describe('Unit: Theme metadata', () => {
    it('should report the double use of support attributes', async () => {
      const file = JSON.parse(themeSettingsMetadata);
      set(file, '0.theme_support_email', 'example@example.com');
      set(file, '0.theme_support_url', 'https://example.com');

      const diagnostics = await validate('config/settings_schema.json', file);
      expect(diagnostics).toStrictEqual([
        {
          message: 'Matches a schema that is not allowed.',
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

    it('reports on missing required fields', async () => {
      const file = `[
        {
          "name": "theme_info"
        }
      ]`;

      const diagnostics = await validate('config/settings_schema.json', file);
      expect(diagnostics).to.have.lengthOf(5);
      for (const missingProp of [
        'theme_support_email',
        'theme_name',
        'theme_author',
        'theme_version',
        'theme_documentation_url',
      ]) {
        expect(diagnostics).toContainEqual(
          expect.objectContaining({
            message: `Missing property "${missingProp}".`,
          }),
        );
      }
    });
  });

  describe('Unit: Settings', () => {
    it('should report invalid enum values', async () => {
      // Using JSON to make a deep copy of one of the valid schemas to mutate safely.
      const settings = `[
        {
          "name": "some category",
          "settings": [
            {
              "type": "not good",
              "id": "some_id",
              "label": "Some Label"
            }
          ]
        }
      ]`;

      const diagnostics = await validate('config/settings_schema.json', settings);
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

    it('has documentation for all input setting types that point to the input settings documentation', async () => {
      for (const inputSetting of inputSettingTypes) {
        const settings = `
          [
            {
              "name": "some category",
              "settings": [
                {
                  "type": "${inputSetting}█"
                }
              ]
            }
          ]`;
        const result = await hover(service, 'config/settings_schema.json', settings);
        assert(result);
        expect(result.contents).toContainEqual(
          expect.stringContaining(
            'https://shopify.dev/docs/themes/architecture/settings/input-settings#' + inputSetting,
          ),
        );
      }
    });

    it('has documentation for all sidebar setting types that point to the sidebar settings documentation', async () => {
      for (const sidebarSetting of sidebarSettingTypes) {
        const settings = `
          [
            {
              "name": "some category",
              "settings": [
                {
                  "type": "${sidebarSetting}█"
                }
              ]
            }
          ]`;
        const result = await hover(service, 'config/settings_schema.json', settings);
        assert(result);
        expect(result.contents).toContainEqual(
          expect.stringContaining(
            'https://shopify.dev/docs/themes/architecture/settings/sidebar-settings#' +
              sidebarSetting,
          ),
        );
      }
    });

    it('has standardized documentation for all setting types', async () => {
      for (const setting of [...inputSettingTypes, ...sidebarSettingTypes]) {
        const settings = `
          [
            {
              "name": "some category",
              "settings": [
                {
                  "type": "${setting}█"
                }
              ]
            }
          ]`;
        const result = await hover(service, 'config/settings_schema.json', settings);
        assert(result);
        expect(result.contents).toContainEqual(
          expect.stringContaining('A setting of type `' + setting + '`'),
        );
      }
    });

    it('completes the type property with the generic documentation', async () => {
      const settings = `[
        {
          "name": "some category",
          "settings": [
            {
              "type█"
            }
          ]
        }
      ]`;
      const result = await complete(service, 'config/settings_schema.json', settings);
      assert(result);
      expect(result.items).toContainEqual(
        expect.objectContaining({
          documentation: expect.stringContaining(
            'This value determines the type of field that gets rendered into the editor.',
          ),
        }),
      );
    });

    it('completes the type value with the setting type enums', async () => {
      const settings = `[
        {
          "name": "some category",
          "settings": [
            {
              "type": "█"
            }
          ]
        }
      ]`;
      const result = await complete(service, 'config/settings_schema.json', settings);
      assert(result);
      expect(result.items).to.have.lengthOf(inputSettingTypes.length + sidebarSettingTypes.length);
      for (const setting of [...inputSettingTypes, ...sidebarSettingTypes]) {
        expect(result.items).toContainEqual(
          expect.objectContaining({
            label: `"${setting}"`,
          }),
        );
      }
    });
  });

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

    it('validates that the definition are of type header, color or color_background', async () => {
      const diagnostics = await validate(
        'config/settings_schema.json',
        settings({ definition: [{ type: 'not good' }] }),
      );
      expect(diagnostics).toStrictEqual([
        expect.objectContaining({
          message: 'Value is not accepted. Valid values: "header", "color", "color_background".',
        }),
      ]);
    });

    it('validates that the definition are of type header, color or color_background (extra properties)', async () => {
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
  });

  describe('Unit: styles', () => {
    it('should report invalid style properties', async () => {
      const settings = `[
        {
          "name": "some category",
          "settings": [
            {
              "type": "style.layout_panel",
              "id": "layout",
              "label": "Layout",
              "default": {
                "flex-rap": "wrap"
              }
            }
          ]
        }
      ]`;

      const diagnostics = await validate('config/settings_schema.json', settings);

      expect(diagnostics).toStrictEqual([
        expect.objectContaining({
          message: 'Property flex-rap is not allowed.',
        }),
      ]);
    });
    
    it('should report invalid property values', async () => {
      const settings = `[
        {
          "name": "some category",
          "settings": [
            {
              "type": "style.layout_panel",
              "id": "layout",
              "label": "Layout",
              "default": {
                "flex-wrap": "rap"
              }
            }
          ]
        }
      ]`;

      const diagnostics = await validate('config/settings_schema.json', settings);

      expect(diagnostics).toStrictEqual([
        expect.objectContaining({
          message: expect.stringContaining(
            'Value is not accepted.',
          ),
        })
        
      ]);
    });

  });
});
