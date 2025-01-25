import { describe, expect, it } from 'vitest';
import { validateSchema } from '../test-helpers';

const validate = validateSchema();

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
  });
});
