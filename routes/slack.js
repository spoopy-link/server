const querystring = require('querystring');
const request = require('snekfetch');
const Constants = require('../Constants');
const isSpoopy = require('../util/is_spoopy');
const log = require('../util/logger');
const serializers = require('../serializers');

module.exports = (router) => {
  router.get('/slack', (req, res) => {
    res.header('Content-Type', 'text/html; charset=utf-8');
    router.cache.get('slack_index').then((t) => res.end(t));
  });

  router.get('/slack/add', (req, res) => {
    const redirect = `https://slack.com/oauth/authorize?${querystring.stringify(Constants.SLACK_OAUTH)}`;
    res.status(302).header('Location', redirect).end();
  });

  router.get('/slack/callback', (req, res) => {
    res.header('Content-Type', 'text/html; charset=utf-8');
    request.post('https://slack.com/api/oauth.access')
      .query({
        client_id: process.env.SLACK_CLIENT_ID,
        client_secret: process.env.SLACK_CLIENT_SECRET,
        code: req.query.code,
        redirect_uri: Constants.SLACK_OAUTH.redirect_uri,
      })
      .then((r) => {
        const team = r.body.team_name;
        router.cache.get('slack_callback').then((t) => res.end(team ? t.replace('your team', team) : t));
      })
      .catch((err) => {
        log('SLACK/CALLBACK', err);
        res.end('error lol');
      });
  });

  router.get('/slack/support', (req, res) => {
    res.header('Content-Type', 'text/html; charset=utf-8');
    router.cache.get('slack_support').then((t) => res.end(t));
  });

  router.get('/slack/privacy', (req, res) => {
    res.header('Content-Type', 'text/html; charset=utf-8');
    router.cache.get('slack_privacy').then((t) => res.end(t));
  });

  router.post('/slack', (req, res) => {
    const body = querystring.parse(req.body);

    if (body.token !== process.env.SLACK_VERIFICATION) {
      res.status(403).end();
      return;
    }

    if (body.text === 'help') {
      res.status(200).end('Please see <https://spoopy.link/slack/support> for help \uD83D\uDC7B');
    } else {
      isSpoopy(body.text.replace(/<|>/g, ''))
        .then((output) => {
          res.status(200).end();
          request.post(body.response_url)
            .send(serializers.slack(output))
            .end();
        })
        .catch((err) => {
          res.status(500).end(Constants.SERVER_ERR_MESSAGE);
          request.post(body.response_url)
            .send(Constants.SERVER_ERR_MESSAGE)
            .end();
          log('SLACK/POST', err);
        });
    }
  });
};
