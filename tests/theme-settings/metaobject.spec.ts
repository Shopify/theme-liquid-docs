import { assert, describe, expect, it } from 'vitest';
import { complete, getService, validateSchema } from '../test-helpers';

const validate = validateSchema();
const service = getService();

describe('Module: theme settings validation (config/settings_schema.json)', () => {
  describe('Unit: metaobject settings', () => {
    it('metaobject setting requires a metaobject_type', async () => {
      const settings = `[
        {
          "name": "some category",
          "settings": [
            {
              "type": "metaobject",
              "id": "metaobject",
              "label": "Metaobject"
            }
          ]
        }
      ]`;

      const diagnostics = await validate('config/settings_schema.json', settings);

      expect(diagnostics).toStrictEqual([
        expect.objectContaining({
          message: `Missing property "metaobject_type".`,
        }),
      ]);
    });

    it('metaobject_list setting requires a metaobject_type', async () => {
      const settings = `[
        {
          "name": "some category",
          "settings": [
            {
              "type": "metaobject_list",
              "id": "metaobject_list",
              "label": "metaobject list"
            }
          ]
        }
      ]`;

      const diagnostics = await validate('config/settings_schema.json', settings);

      expect(diagnostics).toStrictEqual([
        expect.objectContaining({
          message: `Missing property "metaobject_type".`,
        }),
      ]);
    });

    it('metaobject setting allows a valid metaobject_type', async () => {
      const settings = `[
        {
          "name": "some category",
          "settings": [
            {
              "type": "metaobject",
              "id": "metaobject",
              "label": "Metaobject",
              "metaobject_type": "author"
            }
          ]
        }
      ]`;

      const diagnostics = await validate('config/settings_schema.json', settings);

      expect(diagnostics).toHaveLength(0);
    });

    it('metaobject_list setting allows a valid metaobject_type', async () => {
      const settings = `[
        {
          "name": "some category",
          "settings": [
            {
              "type": "metaobject_list",
              "id": "metaobject_list",
              "label": "Metaobject list",
              "metaobject_type": "author"
            }
          ]
        }
      ]`;

      const diagnostics = await validate('config/settings_schema.json', settings);

      expect(diagnostics).toHaveLength(0);
    });

    for (const type of ['metaobject', 'metaobject_list']) {
      it(`${type} setting rejects a default`, async () => {
        const settings = `[
          {
            "name": "some category",
            "settings": [
              {
                "type": "${type}",
                "id": "${type}",
                "label": "Metaobject",
                "metaobject_type": "author",
                "default": "author"
              }
            ]
          }
        ]`;

        const diagnostics = await validate('config/settings_schema.json', settings);

        expect(diagnostics).toStrictEqual([
          expect.objectContaining({
            message: 'Property default is not allowed.',
          }),
        ]);
      });

      it(`${type} setting does not complete a default`, async () => {
        const settings = `[
          {
            "name": "some category",
            "settings": [
              {
                "type": "${type}",
                "id": "${type}",
                "label": "Metaobject",
                "metaobject_type": "author",
                "█"
              }
            ]
          }
        ]`;

        const result = await complete(service, 'config/settings_schema.json', settings);

        assert(result);
        expect(result.items.map((item) => item.label)).toContain('info');
        expect(result.items.map((item) => item.label)).not.toContain('default');
      });
    }
  });
});
