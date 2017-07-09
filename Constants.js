exports.MAX_REDIRECTS = 4;

exports.TICKS = {
  green: 'https://cdn.discordapp.com/emojis/318902154054205460.png',
  red: 'https://cdn.discordapp.com/emojis/312314733816709120.png',
};

exports.SERVER_PORT = 5000;

exports.SERVER_ERR_MESSAGE = 'Checking url failed... Maybe your url is bad?';
exports.SERVER_404_MESSAGE = 'OOOOOooOOOooooooo this page is haunted by the ghost of the spoopy 404';
exports.UA = 'Mozilla/5.0 (compatible; spoopy.link/1.0; +https://spoopy.link)';

exports.UA_REGEX = /(Discord|Slack)Bot/i;

exports.CORS_ORIGINS = [
  'http://spoopy.link',
  'https://spoopy.link',
  'http://gus.host',
  'https://gus.host',
];

exports.REASONS = keyMirror([
  'UNSAFE_LINK',
  'REDIRECT_COUNT',
  'PHISHTANK',
]);

exports.SLACK_OAUTH = {
  client_id: process.env.SLACK_CLIENT_ID,
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
};

const STATIC = [
  'fetch.js',
  'main.js',
  'main.css',
  'keybase.txt',
  'search.xml',
  'sw.js',
  'manifest.webapp',
  'manifest.json',
];

exports.STATIC_RE = new RegExp(`/(${STATIC.join('|')})`);

exports.GH_ROOT = 'https://raw.githubusercontent.com/spoopy-link/site/master';

exports.CHECK_JS = false;

exports.SSL_ERRORS = [
  'UNABLE_TO_GET_ISSUER_CERT',
  'UNABLE_TO_GET_CRL',
  'UNABLE_TO_DECRYPT_CERT_SIGNATURE',
  'UNABLE_TO_DECRYPT_CRL_SIGNATURE',
  'UNABLE_TO_DECODE_ISSUER_PUBLIC_KEY',
  'CERT_SIGNATURE_FAILURE',
  'CRL_SIGNATURE_FAILURE',
  'CERT_NOT_YET_VALID CERT_HAS_EXPIRED',
  'CRL_NOT_YET_VALID',
  'CRL_HAS_EXPIRED ERROR_IN_CERT_NOT_BEFORE_FIELD',
  'ERROR_IN_CERT_NOT_AFTER_FIELD',
  'ERROR_IN_CRL_LAST_UPDATE_FIELD',
  'ERROR_IN_CRL_NEXT_UPDATE_FIELD',
  'OUT_OF_MEM',
  'DEPTH_ZERO_SELF_SIGNED_CERT',
  'SELF_SIGNED_CERT_IN_CHAIN',
  'UNABLE_TO_GET_ISSUER_CERT_LOCALLY',
  'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
  'CERT_CHAIN_TOO_LONG',
  'CERT_REVOKED INVALID_CA',
  'PATH_LENGTH_EXCEEDED',
  'INVALID_PURPOSE CERT_UNTRUSTED',
  'CERT_REJECTED',
];

function keyMirror(arr) {
  return arr.reduce((o, i) => {
    o[i] = i;
    return o;
  }, {});
}
