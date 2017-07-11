const request = require('snekfetch');

const Reputation = [
  'VERY_POOR',
  'POOR',
  'UNSATISFACTORY',
  'GOOD',
  'EXCELLENT',
];

const Components = {
  0: 'TRUSTWORTINESS',
  4: 'CHILD_SAFETY',
};

const Categories = {
  // NEGATIVE
  101: 'MALWARE_OR_VIRUS',
  102: 'POOR_CUSTOMER_EXPERIANCE',
  103: 'PHISHING',
  104: 'SCAM',
  105: 'POTENTIALLY_ILLEGAL',

  // QUESTIONABLE
  201: 'MISLEAING_CLAIMS_OR_UNETHICAL',
  202: 'PRIVACY_RISKS',
  203: 'SUSPECIOUS',
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

function wot(host) {
  return request.get(`https://api.mywot.com/0.4/public_link_json2?hosts=${host}/&key=${process.env.WOT_KEY}`)
  .then((res) => {
    const body = JSON.parse(res.body)[host];

    const components = {
      trustworthiness: body[0],
      child_safety: body[4],
    };

    const categories = body.categories ? Object.entries(body.categories)
      .map(([name, value]) => [Categories[name], value])
      .reduce((o, [n, v]) => { o[n] = v; return o; }, {}) : null;

    let safe = body.categories ? !Object.keys(body.categories)
      .filter(x => x < 300 || x > 400 && x < 404).length : true;

    if (components.child_safety && components.child_safety[0] < 90) safe = false;

    return {
      safe,
      components,
      categories: categories || {},
      blacklists: body.blacklists || {},
    };
  });
}

module.exports = wot;
