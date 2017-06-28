exports.MAX_REDIRECTS = 3;

exports.TICKS = {
  green: 'https://cdn.discordapp.com/emojis/318902154054205460.png',
  red: 'https://cdn.discordapp.com/emojis/312314733816709120.png',
};

exports.SERVER_PORT = 5000;

exports.UA_REGEX = /(Discord|Slack)Bot/i;

exports.CORS_ORIGINS = [
  'http://spoopy.link',
  'https://spoopy.link',
  'http://gus.host',
  'https://gus.host',
];

exports.REASONS = {
  SPOOPY_LINK: 'Redirect trail contains a spoopy link',
  TOO_MANY: 'Too many redirects, could be spoopy',
};

exports.OAUTH = {
  client_id: '203897278339.204022634292',
  redirect_uri: 'https://spoopy.link/slack/callback',
  scope: 'commands',
};
