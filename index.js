
var _ = require('lodash');
var marked = require('marked');
var example = require('marked-example');
var toc = require('markdown-toc');
var mdast = require('mdast');

var renderer = new marked.Renderer();

renderer.code = markedExample({
  classes: {
    container: 'mb2 bg-darken-1 rounded',
    rendered: 'p2',
    code: 'm0 p2 bg-darken-1 rounded-bottom'
  }
});

renderer.heading = function (text, level) {
  var name = _.kebabCase(text);
  var result;
  if (level < 4) {
    result =
      '<h' + level + ' id="' + name + '">'+
        '<a href="#' + name + '">'+ text + '</a>'+
      '</h' + level + '>';
  } else {
    result = '<h' + level + '>' + text + '</h' + level + '>';
  }
  return result;
}

module.exports = function(md, options) {

  var options = _.defaults(options, {
    renderer: renderer
  });
  var results = {};

  function astToHtml(ast) {
    var markdown = mdast.stringify(ast);
    return marked(markdown);
  }

  function splitAst(root) {
    var body = _.cloneDeep(root);
    var headingIndex = _.findIndex(body.children, { type: 'heading' });
    var paragraphIndex = _.findIndex(body.children, { type: 'paragraph' });
    var firstHeading = body.children.splice(headingIndex, 1)[0];
    var firstParagraph = body.children.splice(paragraphIndex, 1)[0];
    var obj = {
      firstHeading: astToHtml(firstHeading),
      firstParagraph: astToHtml(firstParagraph),
      body: astToHtml(body)
    };
    return obj;
  }

  results.html = marked(md, options);
  results.toc = toc(md).json;
  results.ast = mdast.parse(md);
  results.parts = splitAst(results.ast);

  return results;

};

