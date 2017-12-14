# syg-wp-posts-convert
Wordpress get_posts() json to html convert.<br>
Wordpress の get_posts() の json を html に変換する。

## Description
Wordpress側で新着記事一覧などを json_encode() させる。
それを受け取って html 出力させるだけ。
よく使う処理なので npm にしました。

## Usage
### Install
```sh
npm install syg-wp-posts-convert
```

### Wordpress

固定ページ用テンプレートを用意する。<br>
ファイル名 `page-newslist.php` 等のようにして固定ページとして実装することをオススメします。

Wordpress のテンプレートファイル名については Wordpress のドキュメントを参照してください。

```php
<?php
// Wordpress側の固定ページテンプレートです。
// get_posts() に渡すパラメーターや、
// unset() する不要パラメーターは各自で調整してください。

$params = [
    'posts_per_page' => 10
];
$posts = get_posts($params);

// get_posts() ではパーマリンクやアイキャッチ画像のURLが入っていないので、
// 画像サイズも含めて自分で指定する。
// 不要なパラメータも削除する。
// 変換したものを json_encode() でjsonとして表示
$posts = array_map(
    function($post){
        $id = $post->ID;

        // set permalink
        $post->permalink = get_permalink($id);

        // set eyecatch image
        // get_the_post_thumbnail_url() is need Wordpress 4.4 over
        $post->eyecatch = get_the_post_thumbnail_url($id, 'medium');

        // delete unused content
        unset($post->post_content);
        unset($post->post_content_filtered);
        unset($post->post_name);

        return $post;
    },
    $posts
);

echo json_encode($posts);
```

### HTML/JS：シンプルな例

```html
<!--
書き出しテンプレート
{{}} で囲まれた箇所が置換される。
WordpressのWP_Postオブジェクトで使われている名前を使う
-->
<script type="text/x-template" class="js-wp-posts-template">
<li>
    <a href="{{permalink}}">
        {{post_date}} - {{post_title}}
    </a>
</li>
</script>

<!-- 出力先 -->
<ul class="js-wp-posts">
</ul>
```

```JavaScript
import wp_posts_convert from 'syg-wp-posts-convert';

// テンプレートを textContent パラメータで取得。
// start() で jsonr の URL を指定して取得＞表示の流れ
const wp_posts = new Wp_posts_convert({
    template: document.querySelector('.js-wp-posts-template').textContent
});
wp_posts1.start('http://hoge.hoge/wordpress/newslist');
```

### HTML/JS：書き出し先や、ヘルパー関数を指定


```html
<!--
書き出しテンプレート
{{{}}} で囲まれた箇所はヘルパー関数が使用される。
convert_date：日付を任意の書式にする（初期搭載）
convert_maru：数字を丸数字に変換する（後から追加）
-->
<script type="text/x-template" class="js-wp-posts-template">
<li>
    <a href="{{permalink}}">
        {{{convert_date("post_date","YY年MM月DD日")}}} -
        {{{convert_maru("post_title")}}}
    </a>
</li>
</script>

<!--
出力先
クラス名を変更した例
-->
<ul class="js-wp-posts-output">
</ul>
```

```JavaScript
import wp_posts_convert from 'syg-wp-posts-convert';

// 書き出し先エレメントを target で指定
const wp_posts = new Wp_posts_convert({
    template: document.querySelector('.js-wp-posts-template').textContent,
    target: '.js-wp-posts-output'
});

// ヘルパー関数追加
// 数字を漢字にするサンプル
// テンプレートでは引数を「post_title（key）」しか指定していないが、postが暗黙で渡される
wp_posts2.add_helper('convert_maru', function(post, key){
    let output = post[key];
    output = output.replace('1', '①');
    output = output.replace('2', '②');
    output = output.replace('3', '③');
    output = output.replace('4', '④');
    output = output.replace('5', '⑤');
    output = output.replace('6', '⑥');
    output = output.replace('7', '⑦');
    output = output.replace('9', '⑧');
    output = output.replace('9', '⑨');
    output = output.replace('0', '⓪');
    return output;
});

// json取得して表示
// Promise が返されるので表示した後に then() で受け取れる。
// 変換したものを配列で受け取れる
wp_posts.start('http://hoge.hoge/wordpress/newslist')
.then(function(list) {
    console.log(list);
});
```


## Options

```JavaScript
new Wp_posts_convert({Object});
```

| 引数 | デフォルト | 備考 |
| ---- | ---- | ---- |
| template | '&lt;li&gt;&lt;a href="{{permalink}}"&gt;{{post_title}}&lt;/a&gt;&lt;/li&gt;' | 表示テンプレート |
| target | '.js-wp-posts' | 出力先のDOMセレクター |
| helpers | {remove_tag, convert_date} | ヘルパー関数 |

## Methods

### start(url)

json を取得し、変換、表示を行う。
Promise を返すので成功した場合は `.then(list)` で変換後リストを受け取れる。

戻り値：Promise

| 引数 | 型 | 備考 |
| ---- | ---- | --- |
| url | String | json URL |

### add_helper(name, func)

ヘルパー関数を追加。
関数には必ず WP_Post オブジェクトが第一引数として渡される。

| 引数 | 型 | 備考 |
| ---- | ---- | --- |
| name | String | 関数名 |
| func | Function | 関数 |

```javascript
wp_posts.add_helper('convert_maru', function(post, key){
    let output = post[key];
    output = output.replace('1', '①');
    // ...
    return output;
```

## Template

### WP_Post の内容をそのまま置換

`{{パラメータ}}` の部分が置き換えられる。

パラメータ名は [公式サイト WP_Post の説明](https://wpdocs.osdn.jp/%E3%82%AF%E3%83%A9%E3%82%B9%E3%83%AA%E3%83%95%E3%82%A1%E3%83%AC%E3%83%B3%E3%82%B9/WP_Post) を参照。

### パーマリンクとアイキャッチ画像

WP_Postオブジェクトにはパーマリンクやアイキャッチ画像URLが含まれていないので、自分で設定する必要がある（上記 page-newslist.php 参照）。

### 日付など変換したい場合

簡単な置換は `convert_date` というヘルパー関数を用意しているが、詳細な変換をしたければ独自にヘルパー関数を追加する必要がある。

```html
{{{convert_date("post_date","YY年MM月DD日")}}}
```

| 識別子 | 内容 |
| YY | 年（4桁） |
| MM | 月（2桁） |
| DD | 日（2桁） |
| hh | 時（2桁） |
| mm | 分（2桁） |

## Helper

単純な文字列置き換えではなく、加工して出力したい場合はヘルパー関数を使用する。

### convert_date()

標準で搭載しているヘルパー関数。日付を好きなフォーマットに変換する。<br>
シンプルな実装になっているので、月・日などは2桁のままになる。

```html
<!-- テンプレート -->
{{{convert_date("post_date","YY年MM月DD日")}}}
<!-- 出力結果 -->
2017年12月10日
```

### remove_tag

標準で搭載しているヘルパー関数。htmlタグを除去する。<br>

```html
<!-- オリジナルデータ -->
<strong>これはすごい！</strong>
<!-- テンプレート -->
{{{convert_maru("post_title")}}}
<!-- 出力結果 -->
これはすごい！
```


## License
MIT