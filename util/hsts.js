const request = require('snekfetch');

module.exports = (domain) =>
  request.get(`https://hstspreload.org/api/v2/status?domain=${domain}`)
    .then((r) => r.body.status === 'preloaded')
    .catch(() => false);
