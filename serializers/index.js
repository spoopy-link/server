const { TICKS } = require('../Constants');

module.exports = {
  api: {
    v1: require('./api/v1'),
    current: require('./api/v1'),
  },
  og: (result) => `<!DOCTYPE html>
<html>
<head>
<meta property=og:title content="spoopy.link (${result.chain[0].url})">
<meta property=og:description content="${result.safe ? 'Safe' : 'Unsafe'} link! Chain: ${result.chain
  .map((c) => c.url).join(' -> ')}">
<meta property=og:image content="${result.safe ? TICKS.green : TICKS.red}">
<meta property=og:url content="https://spoopy.link/${result.chain[0].url}">
</head>
</html>`,
  slack: (result) => ({
    attachments: [{
      fallback: `${result.chain[0].url} is ${result.safe ? 'safe' : 'unsafe'}!`,
      title: `spoopy.link (${result.chain[0].url})`,
      title_link: `https://spoopy.link/${result.chain[0].url}`,
      text: `${result.safe ? 'Safe' : 'Unsafe'} link! Chain: ${result.chain.map((c) => c.url).join(' -> ')}`,
      footer_icon: result.safe ? TICKS.green : TICKS.red,
      footer: 'spoopy.link',
      ts: Date.now(),
    }],
  }),
};
