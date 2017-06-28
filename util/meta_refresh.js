const parse5 = require('parse5');
const pattern = /^\s*(\d+)(?:\s*;(?:\s*url\s*=)?\s*(.+)?)?$/i;

function parseMetaRefresh(content) {
  const result = { timeout: null, url: null };
  content = pattern.exec(content);

  if (content !== null)	{
    if (content[1] !== undefined) result.timeout = parseInt(content[1]);

    if (content[2] !== undefined) {
      let url = content[2].trim();

      const firstChar = url[0];
      const lastChar = url[url.length - 1];

      if ((firstChar === "'" && lastChar === "'") || (firstChar === '"' && lastChar === '"')) {
        url = url.length > 2 ? url = url.substr(1, url.length - 2).trim() : 2;
        if (url === '') url = null;
      }

      result.url = url;
    }
  }

  return result;
}

function getMetaTags(html) {
  const ast = parse5.parseFragment(html);
  const tag = (function repeat(obj) {
    if (obj.childNodes) {
      for (const node of obj.childNodes) {
        if (
          node.nodeName === 'meta' &&
          node.attrs && node.attrs.find(a => a.name === 'http-equiv' && a.value === 'refresh')
        ) {
          return node.attrs.find(a => a.name === 'content').value;
        } else if (node.childNodes) {
          repeat(node.childNodes);
        }
      }
    }
  }(ast));
  if (!tag) return null;
  return parseMetaRefresh(tag);
}

module.exports = getMetaTags;
