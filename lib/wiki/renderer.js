"use strict";
var Marked = require("marked");
var Crypto = require('crypto');
var Nsh = require('node-syntaxhighlighter');
var Namer = require("./namer");

Marked.setOptions({
  gfm: true,
  pedantic: false,
  sanitize: false, // To be able to add iframes 
  highlight: function (code, lang) {
    return Nsh.highlight(code, Nsh.getLanguage(lang || 'text'), {gutter: !!lang});
  }
});

var tagmap = {};

// Yields the content with the rendered [[bracket tags]]
// The rules are the same for Gollum https://github.com/github/gollum
function extractTags(text) {

  tagmap = {};

  var matches = text.match(/(.?)\[\[(.+?)\]\]([^\[]?)/g);
  var tag;
  var id;

  if (matches) {
    matches.forEach(function (match) {
      match = match.trim();
      tag = /(.?)\[\[(.+?)\]\](.?)/.exec(match);
      if (tag[1] === "'") {
        return;
      }
      id = Crypto.createHash('sha1').update(tag[2]).digest("hex");
      tagmap[id] = tag[2];
      text = text.replace(tag[0], id);
    });

  }
  return text;
}

function evalTags(text) {

  var parts;
  var name;
  var pageName;
  var re;

  for (var k in tagmap) {
    parts = tagmap[k].split("|");
    name = pageName = parts[0];
    if (parts[1]) {
      pageName = parts[1];
    }
    pageName = Namer.normalize(pageName);

    tagmap[k] = "<a class=\"internal\" href=\"/wiki/" + pageName + "\">" + name + "</a>";
  }

  for (k in tagmap) {
    re = new RegExp(k, "g");
    text = text.replace(re, tagmap[k]);
  }

  return text;

  //return text.replace(/\n/g, "");
}

var Renderer = {

  render: function (content) {
    var text = extractTags(content);
    text = evalTags(text);
    return Marked(text);
  }

};

module.exports = Renderer;
