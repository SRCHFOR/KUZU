Package.describe({
  name: 'yogiben:autoform-modals',
  summary: "Create, update and delete collections with modals",
  version: "0.3.8",
  git: "https://github.com/yogiben/meteor-autoform-modals"
});

Package.onUse(function (api) {
  api.versionsFrom('METEOR@1.10.1');

  api.use([
    'jquery',
    'templating',
    'less@3.0.1',
    'session',
    'coffeescript',
    'ui',
    'aldeed:autoform@5.5.1',
    'raix:handlebar-helpers@0.2.5',
    'mpowaga:string-template@0.1.0'
  ], 'client');

  api.addFiles('lib/client/modals.html', 'client');
  api.addFiles('lib/client/modals.coffee', 'client');
  api.addFiles('lib/client/modals.less', 'client');
});

/*Package.onTest(function (api) {
  api.use([
    'jquery',
    'templating',
    'less@3.0.1',
    'session',
    'coffeescript',
    'ui',
    'aldeed:autoform@5.5.1',
    'raix:handlebar-helpers@0.2.5',
    'mpowaga:string-template@0.1.0'
  ], 'client');

  api.addFiles('lib/client/modals.html', 'client');
  api.addFiles('lib/client/modals.coffee', 'client');
  api.addFiles('lib/client/modals.less', 'client');

  api.addFiles('lib/test/test.html', 'client');
  api.addFiles('lib/test/test.js', ['client', 'server']);
});*/
