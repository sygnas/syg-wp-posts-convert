'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

// タグ除去
function removeTag(post, key) {
  var data = post[key];
  return data.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, "");
}

exports["default"] = removeTag;
//# sourceMappingURL=removeTag.js.map
