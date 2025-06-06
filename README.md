# Theme Liquid Docs

Auto-generated documentation for Liquid schemas, drops, tags, and filters. Documentation stays fresh—whenever you update the schema, docs regenerate automatically.

## Quick Start

```bash
git clone https://github.com/Shopify/theme-liquid-docs
cd theme-liquid-docs
yarn install
```

## What's Inside

- **`data/`** — JSON files with Liquid drops, tags, and filters for themes
- **`schemas/`** — JSON Schema definitions for Liquid theme artifacts
- **`ai/`** — Context files that power AI-generated Liquid rules
- **`tests/`** — Test suite ensuring documentation accuracy
- **`scripts/`** — Automation scripts for docs generation

## Working with AI files

The AI sources generates comprehensive Liquid guidelines from modular rules files.

### How it works

The main AI file is `ai/liquid.mdc`, generated from `ai/sources/index.liquid`. This entry point pulls together:

- Context from `ai/sources/*.md` files
- Dynamic content from `ai/sources/*.liquid` templates

Choose `.md` for static content, `.liquid` for dynamic generation.

### Adding new rules

1. **Create your rule file:**
   ```bash
   # Static content
   touch ai/sources/my-new-rule.md

   # Or dynamic content
   touch ai/sources/my-new-rule.liquid
   ```

2. **Add your content:**
   ```liquid
   <!-- ai/sources/my-new-rule.liquid -->
   {% for filter in filters %}
   - `{{ filter.name }}` — {{ filter.description }}
   {% endfor %}
   ```

3. **(Optional) Regenerate the rules:**
  The `ai/liquid.mdc` file updates automatically via GitHub Actions, but you can generate it locally anytime.
   ```bash
   yarn generate:ai
   ```

### Available data

In `.liquid` templates, you have access to:
- `filters` — All available Liquid filters
- `tags` — All Liquid tags
- `objects` — All Liquid objects

Check `ai/sources/_liquid-rules.liquid` for examples.

## Contributing

Help us make these docs better:

1. **Fork** this repository
2. **Create** your feature branch (`git checkout -b improve-liquid-docs`)
3. **Commit** your changes (`git commit -m 'Add array filter examples'`)
4. **Push** and create a Pull Request

## License

MIT License. See [LICENSE](./LICENSE.md) for details.