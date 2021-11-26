// タグ除去
function removeTag(post, key) {
  var data = post[key];
  return data.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, "");
}

export { removeTag as default };
//# sourceMappingURL=removeTag.js.map
