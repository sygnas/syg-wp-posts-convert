'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var convertCustomToNormal = function convertCustomToNormal(post) {
  var data = {
    id: post.ID,
    date: post.post_date,
    title: post.post_title,
    link: post.link,
    eyecatch: post.eyecatch,
    acf: post.acf || {},
    categories: post.categories
  };
  return data;
};

exports["default"] = convertCustomToNormal;
//# sourceMappingURL=convertCustomToNormal.js.map
