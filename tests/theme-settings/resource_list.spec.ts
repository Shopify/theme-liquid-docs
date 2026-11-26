import { describe, expect, it } from 'vitest';
import { validateSchema } from '../test-helpers';
import { RESOURCE_LIST_SETTING_TYPES } from '../test-constants';

const validate = validateSchema();

describe('Module: theme settings validation (config/settings_schema.json)', () => {
  describe.each(RESOURCE_LIST_SETTING_TYPES)('Resource list setting: %s', (setting_type) => {
    it(`${setting_type} does not require a limit`, async () => {
      const metaobject_type =
        setting_type === 'metaobject_list' ? `, "metaobject_type": "author"` : '';
      const settings = `[
        {
          "name": "some category",
          "settings": [
            {
              "type": "${setting_type}",
              "id": "${setting_type}",
              "label": "${setting_type}"
              ${metaobject_type}
            }
          ]
        }
      ]`;

      const diagnostics = await validate('config/settings_schema.json', settings);

      expect(diagnostics).toHaveLength(0);
    });

    it(`${setting_type} allows having a numeric limit`, async () => {
      const metaobject_type =
        setting_type === 'metaobject_list' ? `, "metaobject_type": "author"` : '';
      const settings = `[
        {
          "name": "some category",
          "settings": [
            {
              "type": "${setting_type}",
              "id": "${setting_type}",
              "label": "${setting_type}",
              "limit": 10
              ${metaobject_type}
            }
          ]
        }
      ]`;

      const diagnostics = await validate('config/settings_schema.json', settings);

      expect(diagnostics).not.toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining('limit'),
        }),
      );
    });

    it.each([1, 50])(`${setting_type} accepts a limit of %d`, async (limit) => {
      const diagnostics = await validate(
        'config/settings_schema.json',
        resourceListSettings(setting_type, { limit }),
      );

      expect(diagnostics).toHaveLength(0);
    });

    it.each([
      [0, 'Value is below the minimum of 1.'],
      [51, 'Value is above the maximum of 50.'],
    ])(`${setting_type} rejects a limit of %d`, async (limit, message) => {
      const diagnostics = await validate(
        'config/settings_schema.json',
        resourceListSettings(setting_type, { limit }),
      );

      expect(diagnostics).toContainEqual(expect.objectContaining({ message }));
    });

    it(`${setting_type} does not allow a default`, async () => {
      const diagnostics = await validate(
        'config/settings_schema.json',
        resourceListSettings(setting_type, { default: [] }),
      );

      expect(diagnostics).toContainEqual(
        expect.objectContaining({ message: 'Property default is not allowed.' }),
      );
    });
  });
});

function resourceListSettings(setting_type: string, attributes: Record<string, unknown>) {
  return JSON.stringify([
    {
      name: 'some category',
      settings: [
        {
          type: setting_type,
          id: setting_type,
          label: setting_type,
          ...(setting_type === 'metaobject_list' ? { metaobject_type: 'author' } : {}),
          ...attributes,
        },
      ],
    },
  ]);
}
