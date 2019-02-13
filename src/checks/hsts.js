'use strict';

const fetch = require('node-fetch');
const { NO_HSTS } = require('../constants').REASONS;

module.exports = ({ domain }) => {
  domain = domain.split('.').slice(-2).join('.');

  return fetch(`https://hstspreload.org/api/v2/status?domain=${domain}`)
    .then((r) => r.json())
    .then((b) => (b.status === 'preloaded' ? [] : [NO_HSTS]))
    .catch(() => []);
};
