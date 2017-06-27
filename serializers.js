const { TICKS } = require('./Constants');

module.exports = {
  raw: (result) => result,
  og: (result) => `<!DOCTYPE html>
<html>
<head>
<meta property=og:title content="spoopy.link (${result.trail[0]})">
<meta property=og:description content="${result.safe ? 'Safe' : 'Unsafe'} link! Trail: ${result.trail.join(' -> ')}">
<meta property=og:image content="${result.safe ? TICKS.green : TICKS.red}">
<meta property=og:url content="https://spoopy.link/${result.trail[0]}">
</head>
</html>`,
  slack: (result) => ({
    attachments: [{
      fallback: `${result.trail[0]} is ${result.safe ? 'safe' : 'unsafe'}!`,
      title: `spoopy.link (${result.trail[0]})`,
      title_link: `https://spoopy.link/${result.trail[0]}`,
      text: `${result.safe ? 'Safe' : 'Unsafe'} link! Trail: ${result.trail.join(' -> ')}`,
      footer_icon: result.safe ? TICKS.green : TICKS.red,
      footer: 'spoopy.link',
      ts: Date.now(),
    }],
  }),
};
