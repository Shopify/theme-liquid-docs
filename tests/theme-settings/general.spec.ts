import { assert, describe, expect, it } from 'vitest';
import { complete, getService, hover, loadFixture, validateSchema } from '../test-helpers';

const themeSettingsMetadata = loadFixture('theme-settings-metadata.json');
const themeSettingsAllSettings = loadFixture('theme-settings-all-settings.json');
const themeSettingsDawn = loadFixture('theme-settings-dawn.json');

const inputSettingTypes = [
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
  'html',
  'image_picker',
  'inline_richtext',
  'link_list',
  'liquid',
  'metaobject',
  'metaobject_list',
  'number',
  'page',
  'product_list',
  'product',
  'radio',
  'range',
  'richtext',
  'select',
  'style.layout_panel',
  'style.size_panel',
  'style.spacing_panel',
  'text_alignment',
  'text',
  'textarea',
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
});
