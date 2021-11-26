# syg-wp-posts-convert


## Description
WordpressのREST API、または同梱の`page-newslist.php`が出力するjsonをhtmlに変換する。

---

## Release

- 2021.11.26
  - TypeScriptで書き換え
  - メソッド名をキャメルケースに変更
  - コンストラクタで呼び出しタイプを指定するよう変更
  - REST API、付属の page-newslist.php どちらで取得しても項目名を統一した
- 2021.06.21
  - カテゴリーに対応（要 functions.php の書き換え）
- 2018.11.23
  - Wordpress WP REST API に対応。
  - 過去バージョンの page-newslist.php を使う場合は `type: 'custom'` を指定する必要がある。
  - ヘルパー convert_date() 内での日付分割方法を変更

---

## Install
```
npm install --save @sygnas/wp-posts-convert
```

---

## Wordpressの準備

### REST API使用のパターン

REST APIにはカテゴリ情報が含まれないので、同梱の `wordpress/api_add_category.php` を読み込ませる必要がある。

① 同梱の `wordpress/api_add_category.php` を使用しているテーマのフォルダにコピーする。

② テーマの `functions.php` に下記を追加する。

```
require 'api_add_category.php';
```


### REST APIを使わないで、固定ページを使うパターン

REST APIが許可されていない環境ではこちらの方法を使う。
基本的にはREST APIを使ったほうがラク。

① 同梱の `wordpress/page-newslist.php` をテーマのフォルダにコピーする。

② 固定ページを新規作成し、スラッグを `newslist` にする。

③ `https://{ブログURL}/newslist` を開いてjsonが表示されればOK。

---

## 基本的な実装

REST APIを使用した例。
urlは `data-url` 属性で指定しているが、スクリプトに直書きでも良い。
アイキャッチ画像が不要なら `_embed&` は削除しても良い。

### HTML
```
<!-- テンプレート -->
<script type="text/x-template" class="js-wp-posts-template-1">
  <li>
      <a href="{{link}}">
          {{date}} - {{title}}
      </a>
  </li>
</script>

<!-- この<ul>の中に変換されたデータが入る -->
<!-- data-url属性でREST APIのurlを指定している -->
<ul class="js-wp-posts-1" data-url="https://####.com/news/wp-json/wp/v2/posts?_embed&per_page=3"></ul>
```

### JavaScript
```
import WpPostsConvert from '@sygnas/wp-posts-convert';

// テンプレート
const template1 = document.querySelector('.js-wp-posts-template-1').textContent;
// REST API url
const url1 = document.querySelector('.js-wp-posts-1').dataset.url;
// typeでREST API方式を指定
const convert1 = new WpPostsConvert({
  type: WpPostsConvert.TYPE.REST,
  template: template1,
  target: '.js-wp-posts-1',
});
// urlを渡して実行
convert1.start(url1);
```

---

## 少し手間をかけた実装

REST APIではなく `page-newslist.php` からjsonを取得する例。
他にも日付書式を変換したり、カテゴリー、アイキャッチを表示したり。
ヘルパーサンプルとしてタイトルの数字を丸数字にしている。

### HTML

```
<!-- リストアイテム用テンプレート -->
<script type="text/x-template" class="js-wp-posts-template-2">
  <li>
    <a href="{{link}}">
      <img src="{{eyecatch}}">
      <span>{{{convertDate("date","YY年MM月DD日")}}}</span> -
      {{#loop categories}}
      <span>{{name}}</span>
      {{/#loop}} -
      <span>{{{convertMaru("title")}}}</span>
    </a>
  </li>
</script>

<!-- この<ul>の中に変換されたデータが入る -->
<!-- data-url属性でREST APIのurlを指定している -->
<ul class="js-wp-posts-2" data-url="https://####.com/news/newslist"></ul>
```

### JavaScript

```
// テンプレート
const template2 = document.querySelector('.js-wp-posts-template-2').textContent;
// json取得url
const url2 = document.querySelector('.js-wp-posts-2').dataset.url;
// typeでカスタム方式を指定している
const convert2 = new WpPostsConvert({
  type: WpPostsConvert.TYPE.CUSTOM,
  template: template2,
  target: '.js-wp-posts-2',
});

// ヘルパー関数追加
// 数字を丸数字にするサンプル
// postに記事一件のデータが入り、keyには項目名（ここではtitle）が入る
convert2.addHelper('convertMaru', function(post, key){
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

// Promiseが返されるので、完了後に console.log() を実行
convert2.start(url2)
.then(function(list) {
    console.log("変換したものを配列で受け取る");
    console.log(list);
});
```

---

## Methods

### コンストラクタ

```
constructor(option: TOption = {})
```

#### TOption

| 引数 | デフォルト | 備考 |
| ---- | ---- | ---- |
| type<br>※必須 | WpPostsConvert.TYPE.REST | `WpPostsConvert.TYPE.REST` : Wordpress REST API を使用する / `WpPostsConvert.TYPE.CUSTOM` : 付属の page-newslist.php を使う場合 |
| template | &lt;li&gt;&lt;a href="{{link}}"&gt;{{title}}&lt;/a&gt;&lt;/li&gt; | 表示テンプレート |
| target | '.js-wp-posts' | 出力先のDOMセレクター |
| helpers | {remove_tag, convert_date} | ヘルパー関数 |


### start(url)

```
start(url: string): Promise<any>
```

jsonを取得し、変換、表示を行う。
Promise を返すので成功した場合は `.then(list)` で変換後リストを受け取れる。

戻り値：Promise

| 引数 | 型 | 備考 |
| ---- | ---- | --- |
| url | String | json URL |


### addHelper(name, func)

```
addHelper(name: string, func: THelperFunction): void
```

ヘルパー関数を追加。

| 引数 | 型 | 備考 |
| ---- | ---- | --- |
| name | String | 関数名 |
| func | THelperFunction | 関数 |

```
// サンプル
converter.addHelper('convert_maru', function(post, key){
  let output = post[key];
  output = output.replace('1', '①');
  // ...
  return output;
}
```

#### THelperFunction
ヘルパー関数は必ず引数`post`を付ける。
変換した文字列を戻す。

```
THelperFunction = (post: TWpData, ...args: any) => string;
```

---

## Template

### 単純な変換

```
<img src="{{eyecatch}}">
{{title}}
```

### ループ（カテゴリーで使用）
```
{{#loop categories}}
<span>{{name}}</span>
{{/#loop}} -
```

### ヘルパー関数
```
{{{convert_date("date","YY年MM月DD日")}}}
```

詳細は下記Helperで解説。


### 使用できる項目

- id
- date
- title
- link
- eyecatch
- acf
- categories

---

## Helper

簡単な置換は `convertDate` というヘルパー関数を用意しているが、詳細な変換をしたければ独自にヘルパー関数を追加する必要がある。

下記は搭載しているヘルパー。

### convertDate(項目, フォーマット)

標準で搭載しているヘルパー関数。日付を好きなフォーマットに変換する。<br>

```
<!-- テンプレート -->
{{{convert_date("date","YY年MM月DD日")}}}

<!-- 出力結果 -->
2017年12月10日
```

| 識別子 | 内容 |
| --- | --- |
| YY | 年（4桁） |
| MM | 月（1-2桁） |
| DD | 日（1-2桁） |
| hh | 時（1-2桁） |
| mm | 分（1-2桁） |

### remove_tag(項目)

htmlタグを除去する。<br>

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