exports.MAX_REDIRECTS = 4;

exports.TICKS = {
  green: 'https://cdn.discordapp.com/emojis/318902154054205460.png',
  red: 'https://cdn.discordapp.com/emojis/312314733816709120.png',
};

exports.SERVER_PORT = 5000;

exports.SERVER_ERR_MESSAGE = 'Checking url failed... Maybe your url is bad?';
exports.SERVER_404_MESSAGE = '404. Make sure your url starts with "https://" or "http://"';

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

exports.PAGES = {
  index: '/index.html',
  spoopy: '/404.html',
  slack_index: '/slack/index.html',
  slack_privacy: '/slack/privacy.html',
  slack_support: '/slack/support.html',
  slack_callback: '/slack/callback.html',
  css: '/main.css',
  js: '/main.js',
  keybase: '/keybase.txt',
};

exports.GH_ROOT = 'https://raw.githubusercontent.com/devsnek/spoopy.link/gh-pages';

exports.CHECK_JS = false;
