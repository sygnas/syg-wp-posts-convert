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

export { convertCustomToNormal as default };
//# sourceMappingURL=convertCustomToNormal.js.map
