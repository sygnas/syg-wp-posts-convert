<?php
// Wordpress側の固定ページテンプレートです。
// get_posts() に渡すパラメーターや、
// unset() する不要パラメーターは各自で調整してください。

$params = [
  'posts_per_page' => 5
];
$posts = get_posts($params);

// get_posts() ではパーマリンクやアイキャッチ画像のURLが入っていないので、
// 画像サイズも含めて自分で指定する。
// 不要なパラメータも削除する。
// 変換したものを json_encode() でjsonとして表示
$posts = array_map(
  function ($post) {

    $id = $post->ID;

    // set permalink
    $post->permalink = get_permalink($id);

    // set eyecatch image
    // get_the_post_thumbnail_url() is need Wordpress 4.4 over
    $post->eyecatch = get_the_post_thumbnail_url($id, 'medium');

    // category
    $post->categories = get_category_list($id);

    // delete unused content
    unset($post->post_excerpt);
    unset($post->post_content);
    unset($post->post_content_filtered);
    unset($post->post_name);
    unset($post->post_status);
    unset($post->post_password);
    unset($post->post_parent);
    unset($post->post_mime_type);
    unset($post->guid);
    unset($post->menu_order);
    unset($post->pinged);
    unset($post->to_ping);
    unset($post->ping_status);
    unset($post->comment_status);
    unset($post->comment_count);
    unset($post->filter);

    return $post;
  },
  $posts
);

echo json_encode($posts);


/**
 * get category list
 */
function get_category_list($id)
{
  $categories = get_the_category($id);

  if (!$categories) {
    return $output;
  }

  $list = [];

  foreach ($categories as $category) {
    array_push($list, [
      'name' => $category->name,
      'slug' => $category->slug,
      'link' => get_category_link($category->cat_ID)
    ]);
  }

  return $list;
}
