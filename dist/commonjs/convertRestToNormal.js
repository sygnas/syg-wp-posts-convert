'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var convertRestToNormal = function convertRestToNormal(post) {
  var eyecatch = post._embedded ? post._embedded['wp:featuredmedia'][0].media_details.sizes.medium.source_url : '';
  var data = {
    id: post.id,
    date: post.date,
    title: post.title.rendered,
    link: post.link,
    eyecatch: eyecatch,
    acf: post.acf || [],
    categories: post.cat_info || []
  };
  return data;
};

exports["default"] = convertRestToNormal;
//# sourceMappingURL=convertRestToNormal.js.map
