const TAG_MATCH = /<\/?\s*([\w-]+)\s*/;
// /(?:(<([\w-]+)\s*)|(<\/?\s*([\w-]+)\s*))/g;
const ENDTAG_MATCH = /<\/\s*([\w-]+)\s*/;
const JS_OR_HTML_REG = /\.(?:js|html)$/;
const COMPONENT_DIR_PATH = '/src/app/client/components';
const CONTAINER_COMPONENT_DIR_PATH = '/src/app/client/module';
const EXCLUDE_TRAVERSE_DIRNAMES = ['flow'];
const NORMAL_HTMLELMENT_ARRAY = ['div', 'span', 'li', 'ul', 'table', 'tbody', 'thead', 'i', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'body', 'footer', 'button', 'p', 'label', 'img', 'a', 'label', 'iframe', 'video', 'canvas'];

export {
  TAG_MATCH,
  JS_OR_HTML_REG,
  NORMAL_HTMLELMENT_ARRAY,
  COMPONENT_DIR_PATH,
  CONTAINER_COMPONENT_DIR_PATH,
  EXCLUDE_TRAVERSE_DIRNAMES,
  ENDTAG_MATCH,
};