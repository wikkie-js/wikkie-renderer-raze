var raze = require('raze-tpl');
var path = require('path');

var wikkie;

exports.init = function init(wikkie, conf) {
  var utils = wikkie.utils;
  var config = wikkie.config;
  var tplCache = new Map();
  var theme = config.theme;
  var themeDir = utils.pathToWorking('theme', theme, '_layout');

  function getTpl(template) {
    var filename = path.join(themeDir, template + '.html');
    if (!tplCache.has(filename)) {
      var render = raze(utils.assign({
        filename: filename,
        strip: false,
        safe: true
      }, conf));
      tplCache.set(filename, Promise.resolve(render));
    }
    return tplCache.get(filename);
  }

  function main(generatedFile, locals) {
    var template = generatedFile.template;
    return getTpl(template).then(function(render) {
      try {
        var content = render(generatedFile.data);
      } catch(ex) {
        wikkie.log.warning('render error', template, ex);
      }
      generatedFile.content = content;
    });
  }

  function reset(locals) {
    locals.changedFiles.forEach(filename => {
      if (tplCache.has(filename)) {
        console.log('clear tpl cache', filename);
        tplCache.delete(filename);
      }
    });
  }

  wikkie.plugins.renderer.add('wikkie-renderer-raze', 'page', main, undefined, undefined, reset);
}
