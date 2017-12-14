
// タグ除去
export default function remove_tag(post, key) {

    return post[key].replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,'');

}
