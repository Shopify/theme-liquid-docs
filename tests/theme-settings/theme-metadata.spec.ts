import set from 'lodash.set';
import { describe, expect, it } from 'vitest';
import { loadFixture, validateSchema } from '../test-helpers';

const themeSettingsMetadata = loadFixture('theme-settings-metadata.json');

const validate = validateSchema();

describe('Module: theme settings validation (config/settings_schema.json)', () => {
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
});
