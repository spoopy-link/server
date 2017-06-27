exports.MAX_REDIRECTS = 3;

exports.TICKS = {
  green: 'https://cdn.discordapp.com/emojis/318902154054205460.png',
  red: 'https://cdn.discordapp.com/emojis/312314733816709120.png',
};

exports.SERVER_PORT = 5000;

exports.UA_REGEX = /DiscordBot/i;

exports.CORS_ORIGINS = [
  'http://spoopy.link',
  'https://spoopy.link',
  'http://spoopy-link.now.sh',
  'https://spoopy-link.now.sh',
  'http://gus.host',
  'https://gus.host',
];

exports.REASONS = {
  SPOOPY_LINK: 'Redirect trail contains a spoopy link',
  TOO_MANY: 'Too many redirects, could be spoopy',
};
