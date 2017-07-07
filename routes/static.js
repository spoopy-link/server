module.exports = (router) => {
  router.get('/search.xml', (req, res) => {
    res.header('Content-Type', 'application/xml; charset=utf-8');
    router.cache.get('search_xml').then((t) => res.end(t));
  });

  router.get('/main.css', (req, res) => {
    res.header('Content-Type', 'text/css; charset=utf-8');
    router.cache.get('css').then((t) => res.end(t));
  });

  router.get('/main.js', (req, res) => {
    res.header('Content-Type', 'application/javascript; charset=utf-8');
    router.cache.get('js').then((t) => res.end(t));
  });

  router.get('/keybase.txt', (req, res) => {
    router.cache.get('keybase').then((t) => res.end(t));
  });
};
