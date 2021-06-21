# syg-wp-posts-convert
Wordpress get_posts() json to html convert.<br>
Wordpress の get_posts() の json を html に変換する。

## Description
Wordpress側で新着記事一覧などを json_encode() させる。
それを受け取って html 出力させるだけ。
よく使う処理なので npm にしました。

## Release

- 2021.06.21
  - カテゴリーに対応（要 functions.php の書き換え）
- 2018.11.23
  - Wordpress WP REST API に対応。
  - 過去バージョンの page-newslist.php を使う場合は `type: 'custom'` を指定する必要がある。
  - ヘルパー convert_date() 内での日付分割方法を変更

## Usage
### Install
```
npm install --save @sygnas/wp-posts-convert
```

### Wordpress（REST API使用のパターン）

標準の記事取得 REST API にはカテゴリ情報が含まれないので、使用するテンプレートの `functions.php` に下記の記述を追加する必要がある。
関数名などは適宜変更しても良い。

```
/**
* REST API にカテゴリ情報を含める
**/
add_action( 'rest_api_init', 'api_add_fields' );

function api_add_fields() {
  register_rest_field(
    'post',
    'cat_info',
    array(
      'get_callback'    => 'register_fields',
      'update_callback' => null,
      'schema'          => null,
    )
  );
}

function register_fields( $post, $name ) {
  $categories = get_the_category($post['id']);

  $categories = array_map(function($category){
    $category->link = get_category_link($category->term_id);
    return $category;
  }, $categories);

  return $categories;
}
```


### Wordpress（REST API不使用のパターン）

固定ページ用テンプレートファイルを用意する。<br>
≫[サンプル](./wordpress/page-newslist.php)

ファイル名 `page-newslist.php` として保存し、テンプレートと同じ場所に設置する。

同名の固定ページ「{ブログURL}/newslist」を作成する。

Wordpress のテンプレートファイル名については Wordpress のドキュメントを参照してください。


### Javascript

```
import wp_posts_convert from '@sygnas/wp-posts-convert';

// テンプレートを textContent パラメータで取得。
// start() で jsonr の URL を指定して取得＞表示の流れ
const wp_posts = new Wp_posts_convert({
    type: 'rest',
    template: document.querySelector('.js-wp-posts-template').textContent
});
wp_posts.start('http://hoge.hoge/wordpress/wp-json/wp/v2/posts');
```

### HTML：シンプルな例

```
<!--
書き出しテンプレート
{{}} で囲まれた箇所が置換される。
Wordpressの REST API で使用されている名前を使う
-->
<script type="text/x-template" class="js-wp-posts-template">
<li>
    <a href="{{link}}">
        {{date}} - {{title}}
    </a>
</li>
</script>

<!-- 出力先 -->
<ul class="js-wp-posts">
</ul>
```


### HTML：カテゴリも表示

```
<!--
{{#loop categories}}〜{{/#loop}} 内がくり返される。
-->
<script type="text/x-template" class="js-wp-posts-template">
<li>
    <a href="{{link}}">
        {{date}} -
        {{#loop categories}}
          <a href="{{link}}" class="{{slug}}">{{name}}</a>
        {{/#loop}} -
        {{title}}
    </a>
</li>
</script>

<!-- 出力先 -->
<ul class="js-wp-posts">
</ul>
```


### HTML/JS：書き出し先や、ヘルパー関数を指定

```
<!--
書き出しテンプレート
{{{}}} で囲まれた箇所はヘルパー関数が使用される。
convert_date：日付を任意の書式にする（初期搭載）
convert_maru：数字を丸数字に変換する（後から追加）
-->
<script type="text/x-template" class="js-wp-posts-template">
<li>
    <a href="{{permalink}}">
        {{{convert_date("date","YY年MM月DD日")}}} -
        {{{convert_maru("title")}}}
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

```
import wp_posts_convert from '@sygnas/wp-posts-convert';

// 書き出し先エレメントを target で指定
const wp_posts = new Wp_posts_convert({
    type: 'rest',
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
wp_posts.start('http://hoge.hoge/wordpress/wp-json/wp/v2/posts')
.then(function(list) {
    console.log(list);
});
```


## Options

```
new Wp_posts_convert({Object});
```

| 引数 | デフォルト | 備考 |
| ---- | ---- | ---- |
| type | 'rest' | `rest` : Wordpress REST API を使用する / `custom` : 付属の page-newslist.php を使う場合 |
| template | '&lt;li&gt;&lt;a href="{{permalink}}"&gt;{{post_title}}&lt;/a&gt;&lt;/li&gt;' | 表示テンプレート |
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

```
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

```
{{{convert_date("date","YY年MM月DD日")}}}
```

| 識別子 | 内容 |
| --- | --- |
| YY | 年（4桁） |
| MM | 月（2桁） |
| DD | 日（2桁） |
| hh | 時（2桁） |
| mm | 分（2桁） |

## Helper

単純な文字列置き換えではなく、加工して出力したい場合はヘルパー関数を使用する。

### convert_date()

標準で搭載しているヘルパー関数。日付を好きなフォーマットに変換する。<br>
シンプルな実装になっているので、月・日などは2桁のままになる。

```
<!-- テンプレート -->
{{{convert_date("post_date","YY年MM月DD日")}}}
<!-- 出力結果 -->
2017年12月10日
```

### remove_tag

標準で搭載しているヘルパー関数。htmlタグを除去する。<br>

```
<!-- オリジナルデータ -->
<strong>これはすごい！</strong>
<!-- テンプレート -->
{{{remove_tag("post_title")}}}
<!-- 出力結果 -->
これはすごい！
```


## License
MIT