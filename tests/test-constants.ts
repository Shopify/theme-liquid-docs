export const SETTINGS_TYPES_NOT_SUPPORTING_VISIBLE_IF = [
  'article',
  'blog',
  'collection',
  'collection_list',
  'metaobject',
  'metaobject_list',
  'page',
  'product',
  'product_list',
  // Not featured here is `color_scheme_group` which is exclusive to settings_schema.json.
  // That setting type is tested in `color_scheme_group.spec.ts`.
];

export const INPUT_SETTING_TYPES = [
  'article',
  'blog',
  'checkbox',
  'collection_list',
  'collection',
  'color_background',
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
  'style.layout_panel',
  'style.size_panel',
  'style.spacing_panel',
  'text_alignment',
  'text',
  'textarea',
  'url',
  'video_url',
  'video',
];

export const SIDEBAR_SETTING_TYPES = ['header', 'paragraph'];

export const RESOURCE_LIST_SETTING_TYPES = ['product_list', 'collection_list', 'metaobject_list'];
