<structure>
  - Use semantic HTML
  - Prefer `<details>` and `<summary>` over JS for show/hide
  - Use `CamelCase` for IDs. Append `-{{ block.id }}` or `-{{ section.id }}`
</structure>

<accessibility>
  - Make interactive elements focusable with `tabindex="0"`
  - Only use `tabindex="0"` - avoid hijacking tab flow
</accessibility>
