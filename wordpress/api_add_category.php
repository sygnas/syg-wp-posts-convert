<?php
/**
 * REST API にカテゴリー情報を含める
 * https://dev.ore-shika.com/post/wp-rest-cat-info/
 *
 * 通常のREST APIにはカテゴリー情報が含まれていませんので、カテゴリーを含めたい時はこのファイルを使用します。
 * functions.php からこのファイルを require してください。
 *
 * usage:
 * // functions.php
 * require 'api_add_category.php';
 */

add_action( 'rest_api_init', 'api_add_fields' );

function api_add_fields() {
  register_rest_field( 'post',
    'cat_info',
     array(
      'get_callback'    => 'register_fields',
      'update_callback' => null,
      'schema'          => null,
    )
  );
}

function register_fields( $post, $name ) {
  return get_the_category($post['id']);
}