'use strict';

const pattern = /^\s*(\d+)(?:\s*;(?:\s*url\s*=)?\s*(.+)?)?$/i;

function parseMetaRefresh(content) {
  const result = { timeout: null, url: null };
  content = pattern.exec(content);

  if (content !== null) {
    if (content[1] !== undefined) {
      result.timeout = Number.parseInt(content[1], 10);
    }


    if (content[2] !== undefined) {
      let url = content[2].trim();

      const firstChar = url[0];
      const lastChar = url[url.length - 1];

      if ((firstChar === "'" && lastChar === "'") || (firstChar === '"' && lastChar === '"')) {
        url = url.length > 2 ? url = url.substr(1, url.length - 2).trim() : 2;
        if (url === '') {
          url = null;
        }
      }

      result.url = url;
    }
  }

  return result;
}

module.exports = parseMetaRefresh;
