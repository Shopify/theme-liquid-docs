folder_structure = {
  sections: theme_sections(),
  blocks: theme_blocks(),
  layout: theme_layout(),
  snippets: theme_snippets(),
  config: theme_config(),
  assets: theme_assets(),
  locales: theme_locales(),
  templates: theme_templates(),
  templates/customers: theme_templates/customers(),
  templates/metaobject: theme_templates/metaobject()
}
theme_sections = {
  - Liquid files that define customizable sections of a page
  - They include blocks and settings defined via a schema, allowing merchants to modify them in the theme editor
  - Should occupy the full width of the page container and be self-contained layout units
  - Can be added to any JSON template and reordered via the theme editor
  - Must include a {% schema %} tag to define settings and presets
  - Examples: hero banners, product grids, testimonials, featured collections
}
theme_blocks = {
  - Configurable elements within sections that can be added, removed, or reordered
  - They are defined with a schema tag for merchant customization in the theme editor
  - Allow merchants to build dynamic content without code changes
  - Each block has a type and can contain settings for text, images, groups, links, etc.
  - Limited to specific block types defined in the section's schema
  - Blocks can be nested within other blocks to create hierarchical content structures
  - Examples: individual testimonials, slides in a carousel, feature items
}
theme_layout = {
  - Defines the structure for repeated content such as headers and footers, wrapping other template files
  - It's the frame that holds the page together, but it's not the content
  - Contains the HTML document structure (head, body tags)
  - Includes global elements like navigation, cart drawer, and footer
  - Typically includes global CSS/JS assets and meta tags or render a snippet that do that
}
theme_snippets = {
  - Reusable code fragments included in templates, sections, and layouts via the render tag
  - Ideal for logic that needs to be reused but not directly edited in the theme editor
  - Can accept parameters when rendered for dynamic behavior
  - Perfect for repetitive UI components like product cards, buttons, or form elements
  - Help maintain DRY (Don't Repeat Yourself) principles in theme development
  - Examples: product-card.liquid, icon.liquid, price.liquid
}
theme_config = {
  - Holds settings data and schema for theme customization options, accessible through the Admin theme editor
  - Stores global theme context like typography, colors, spacing, and branding
  - Contains theme-wide settings that affect multiple pages (global variables)
  - Includes presets for different theme variations or demo content
  - Settings are accessible via settings object in all Liquid files
  - Examples: brand colors, font choices, layout options, feature toggles
}
theme_assets = {
  - Contains static files such as CSS, JavaScript, and images referenced via asset_url filter
  - Includes compiled stylesheets, JavaScript bundles, and media files
  - Can be organized in subdirectories for better file management
  - Supports asset optimization and minification for performance
  - Images should be optimized and include responsive variants when possible
  - Examples: theme.css, theme.js, logo.png, icon sprites
}
theme_locales = {
  - Stores translation files for localizing theme editor and storefront content
  - Organized by language code (en.default.json, fr.json, etc.)
  - Contains translations for static text, labels, and theme editor strings
  - Enables multi-language support and proper internationalization
  - Accessed via translation filters like {{ 'key' | t }} in Liquid
  - Should cover all user-facing text for complete localization
}
theme_templates = {
  - JSON files that specify which sections appear on each page type (e.g., product, collection, blog)
  - They are wrapped by layout files for consistent header/footer content
  - Templates can be Liquid files as well, but JSON is preferred as best practice for flexibility
  - Define the page structure and section ordering for different page types
  - Allow merchants to customize page layouts without code changes
  - Support alternate templates for A/B testing or different page variants
}
theme_templates/customers = {
  - Templates for customer-related pages such as login, register, account overview, and order history
  - Handle customer authentication flows and account management interfaces
  - Include forms for login, registration, password reset, and profile updates
  - Must follow Shopify's customer data handling and security requirements
  - Examples: login.json, register.liquid, account.json, order.liquid
}
theme_templates/metaobject = {
  - Templates for rendering custom content types defined as metaobjects in Shopify Admin
  - Enable custom content structures beyond standard product/collection/page types
  - Allow merchants to create structured content like team members, locations, or custom landing pages
  - Must handle dynamic field rendering based on metaobject definition
  - Examples: team-member.json, location.liquid, custom-page.json
}
∀ file ∈ theme:
  validate(file.location) ∈ folder_structure;
