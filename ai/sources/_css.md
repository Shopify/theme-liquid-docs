<specificity>
  - Never use IDs as selectors for styles
  - Avoid element selectors
  - Avoid !important (comment why if absolutely necessary)
  - Use 0 1 0 specificity (single .class selector)
  - Maximum 0 4 0 specificity for parent/child relationships
  - Keep selectors simple and readable
  - Use pseudo selectors sparingly (:has, :where, :nth-child, et )
</specificity>

<variables>
  - Use CSS variables to reduce redundancy
  - Hardcode values as variables first (e.g. --touch-target-size: 44px)
  - Never hardcode colors, use color schemes
  - Scope variables to components unless global
  - Global variables go in :root (in may live in a file like snippets/theme-styles-variables.liquid)
  - Scoped variables can reference global variables
</variables>

<scoping>
  - Use {% stylesheet %} tags in sections, blocks, and snippets
  - Reset CSS variables inline with style attributes for settings
  - Avoid {% style %} tags with block/section ID selectors
  - Use variables to reduce redundancy
</scoping>

<bem>
  - Block: component name
  - Element: block__element
  - Modifier: block--modifier, block__element--modifier
  - Use dashes to separate words
</bem>

<media-queries>
  - Mobile first (min-width queries)
  - Use screen for all media queries
</media-queries>

<nesting>
  - No & operator
  - Never nest beyond first level
  - Exceptions: media queries, parent-child with multiple states
  - Keep nesting simple
</nesting>
