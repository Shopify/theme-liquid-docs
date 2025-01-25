import { describe, expect, it } from 'vitest';
import { validateSchema } from '../test-helpers';

const validate = validateSchema();

describe('Module: theme settings validation (config/settings_schema.json)', () => {
  describe('Unit: styles', () => {
    it('should allow valid style settings and breakpoints', async () => {
      const settings = `[
        {
          "name": "some category",
          "settings": [
            {
              "type": "style.layout_panel",
              "id": "layout",
              "label": "Layout",
              "default": {
                "gap": "10px 10px",
                "row-gap": "10px",
                "column-gap": "10px",
                "flex-direction": "row",
                "flex-wrap": "wrap",
                "align-items": "center",
                "@media (--mobile)": {
                  "flex-direction": "column",
                  "align-items": "stretch",
                  "gap": "0px"
                }
              }
            },
            {
              "type": "style.spacing_panel",
              "id": "spacing",
              "label": "Spacing",
              "default": {
                "padding": "10px 20px",
                "margin": "10px 20px 10px 20px",
                "@media (--mobile)": {
                  "padding-block": "10px 20px",
                  "margin-top": "0px",
                  "margin-inline": "20px",
                  "margin-inline-end": "1px"
                }
              }
            },
            {
              "type": "style.size_panel",
              "id": "size",
              "label": "Size",
              "default": {
                "flex-grow": "2",
                "width": "25%",
                "height": "25px",
                "@media (--mobile)": {
                  "width": "100%",
                  "flex-grow": "0"
                }
              }
            }
          ]
        }
      ]`;

      const diagnostics = await validate('config/settings_schema.json', settings);

      expect(diagnostics).toHaveLength(0);
    });

    it('should report invalid style setting panel types', async () => {
      const settings = `[
        {
          "name": "some category",
          "settings": [
            {
              "type": "styles.layout_panel",
              "id": "layout",
              "label": "Layout",
              "default": {
                "gap": "20px"
              }
            }
          ]
        }
      ]`;

      const diagnostics = await validate('config/settings_schema.json', settings);

      expect(diagnostics).toStrictEqual([
        expect.objectContaining({
          message: expect.stringContaining('Value is not accepted.'),
        }),
      ]);

      expect(diagnostics).toStrictEqual([
        expect.objectContaining({
          message: expect.stringContaining('style.layout_panel'),
        }),
      ]);
    });

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
            },
            {
              "type": "style.spacing_panel",
              "id": "spacing",
              "label": "Spacing",
              "default": {
                "pudding": "20px"
              }
            },
            {
              "type": "style.size_panel",
              "id": "size",
              "label": "Size",
              "default": {
                "width": "fit-content",
                "@media (--mobile)": {
                  "width": "100%",
                  "flex-shrunk": "0"
                }
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
        expect.objectContaining({
          message: 'Property pudding is not allowed.',
        }),
        expect.objectContaining({
          message: 'Property flex-shrunk is not allowed.',
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
                "row-gap": "-10px",
                "column-gap": "-10px",
                "gap": "-10px -10px",
                "flex-wrap": "rap"
              }
            }
          ]
        }
      ]`;

      const diagnostics = await validate('config/settings_schema.json', settings);

      expect(diagnostics).toHaveLength(4);
      expect(diagnostics).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining('Value is not accepted.'),
        }),
      );
      expect(diagnostics).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining('String does not match the pattern'),
        }),
      );
    });

    it('should report invalid breakpoints', async () => {
      const settings = `[
        {
          "name": "some category",
          "settings": [
            {
              "type": "style.size_panel",
              "id": "size",
              "label": "Size",
              "default": {
                "width": "fit-content",
                "@media (--iphone)": {
                  "width": "100%",
                  "flex-shrink": "0"
                }
              }
            }
          ]
        }
      ]`;

      const diagnostics = await validate('config/settings_schema.json', settings);

      expect(diagnostics).toStrictEqual([
        expect.objectContaining({
          message: expect.stringContaining('Property @media (--iphone) is not allowed'),
        }),
      ]);
    });
  });
});
