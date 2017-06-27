const { TICKS } = require('./Constants');

module.exports = {
  raw: (result) => result,
  og: (result) => `<!DOCTYPE html>
<html>
<head>
<meta property=og:title content="Spoopy.link (${result.trail[0]})">
<meta property=og:description content="${result.safe ? 'Safe' : 'Unsafe'} link! Trail: ${result.trail.join(' -> ')}">
<meta property=og:image content="${result.safe ? TICKS.green : TICKS.red}">
<meta property=og:url content="https://spoopy.link/${result.trail[0]}">
</head>
</html>`,
};
