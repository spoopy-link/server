'use strict';

const fetch = require('node-fetch');
const { PHISHTANK } = require('../constants').REASONS;

let phish = [];

console.log('Loading phishtank');

fetch('https://data.phishtank.com/data/online-valid.json')
  .then((r) => r.json())
  .then((b) => {
    phish = b;
    console.log('Phishlank loaded!');
  });

module.exports = ({ url }) => {
  if (phish.length && phish.some((p) => p.url === url)) {
    return [PHISHTANK];
  }

  return [];
};
