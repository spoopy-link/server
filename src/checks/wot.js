'use strict';

const fetch = require('node-fetch');
const { WOT_KEY } = require('../constants');

const Categories = {
  // NEGATIVE
  101: 'MALWARE_OR_VIRUS',
  102: 'POOR_CUSTOMER_EXPERIENCE',
  103: 'PHISHING',
  104: 'SCAM',
  105: 'POTENTIALLY_ILLEGAL',

  // QUESTIONABLE
  201: 'MISLEADING_CLAIMS_OR_UNETHICAL',
  202: 'PRIVACY_RISKS',
  203: 'SUSPICIOUS',
  204: 'HATE_DISCRIMINTATION',
  205: 'SPAM',
  206: 'PUP',
  207: 'ADS_POPUPS',

  // NEUTRAL
  301: 'ONLINE_TRACKING',
  302: 'ALTERNATIVE_OR_CONTROVERSIAL_NATURE',
  303: 'OPINIONS_RELIGION_POLITICS',
  304: 'OTHER',

  // CHILD_SAFETY
  401: 'ADULT_CONTENT',
  402: 'INCIDENTAL_NUDITY',
  403: 'GRUESOM_OR_SHOCKING',
  404: 'SITE_FOR_KIDS',

  // POSITIVE
  501: 'GOOD_SITE',

  Meta: {
    NEGATIVE: 100,
    QUESTIONABLE: 200,
    NEURTAL: 300,
    CHILD_SAFETY: 400,
    POSITIVE: 500,
  },
};

module.exports = ({ domain }) =>
  fetch(`https://api.mywot.com/0.4/public_link_json2?hosts=${domain}/&key=${WOT_KEY}`)
    .then((r) => r.json())
    .then((body) => {
      const entry = body[domain];
      const reasons = [];

      if (entry) {
        if (entry[4] && entry[4][0] < 70) {
          reasons.push('CHILD_SAFETY');
        }

        if (entry.categores) {
          reasons.push(...Object.entries(entry.categories)
            .filter(([k]) => k < 300 || (k > 400 && k < 404))
            .reduce((o, [n, v]) => {
              o[Categories[n]] = v; return o;
            }, {}));
        }
      }

      return reasons;
    });
