const { JSDOM } = require('../../jsdom');

const dom = new JSDOM(`
<html>
<head>
<meta http-equiv="refresh" content="0; url=https://discord.gg/9Uxmv8Y">
<meta property="og:url" content="https://discord.gg/9Uxmv8Y" />
</head>
<body>
<script>
document.location.href="https://discord.gg/9Uxmv8Y";
</script>
</body>
</html>`, {
  runScripts: 'dangerously',
  onNavigationChange: console.log,
});
