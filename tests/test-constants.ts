export const SETTINGS_TYPES_NOT_SUPPORTING_VISIBLE_IF = [
  'article',
  'article_list',
  'blog',
  'collection',
  'collection_list',
  'metaobject',
  'metaobject_list',
  'page',
  'product',
  'product_list',
  // Not featured here is `color_scheme_group` and `color_palette` which are exclusive to settings_schema.json.
  // Those setting types are tested in `color_scheme_group.spec.ts` and `color_palette.spec.ts`.
];

export const INPUT_SETTING_TYPES = [
  'article',
  'article_list',
  'blog',
  'checkbox',
  'collection_list',
  'collection',
  'color_background',
  'color_palette',
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
  'text_alignment',
  'text',
  'textarea',
  'url',
  'video_url',
  'video',
];

// Setting types that are only valid in config/settings_schema.json,
// not in section or block schemas. Tested in their own *.spec.ts files.
export const SETTINGS_TYPES_EXCLUSIVE_TO_SETTINGS_SCHEMA = ['color_scheme_group', 'color_palette'];

export const SIDEBAR_SETTING_TYPES = ['header', 'paragraph'];

export const RESOURCE_LIST_SETTING_TYPES = ['article_list', 'collection_list', 'metaobject_list', 'product_list'];
