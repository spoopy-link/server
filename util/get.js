const https = require('https');
const { createPromise, promiseResolve, promiseReject } = process.binding('util');

module.exports = (...args) => {
  const promise = createPromise();
  https.get(...args, (res) => {
    const chunks = [];
    res.on('data', chunk => chunks.push(chunk));
    res.on('end', () => {
      res.text = Buffer.concat(chunks).toString();
      promiseResolve(promise, res);
    });
    res.on('error', (err) => {
      promiseReject(promise, err);
    });
  });
  return promise;
};
