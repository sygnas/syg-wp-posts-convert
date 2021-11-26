
import WpPostsConvert from '../../dist/es6/index';


/**
 * シンプルなリスト
 * 取得URL例
 * https://####.com/news/wp-json/wp/v2/posts?_embed&per_page=3
 */
const template1 = document.querySelector('.js-wp-posts-template-1').textContent;
const url1 = document.querySelector('.js-wp-posts-1').dataset.url;
const convert1 = new WpPostsConvert({
  type: WpPostsConvert.TYPE.REST,
  template: template1,
  target: '.js-wp-posts-1',
});
convert1.start(url1);


///////////////////////////////////////////

/**
 * 日付変換などを指定したパターン
 * page-newslist.php を呼び出している。もちろん REST API でも良い。
 * https://####.com/news/newslist
 */
 const template2 = document.querySelector('.js-wp-posts-template-2').textContent;
 const url2 = document.querySelector('.js-wp-posts-2').dataset.url;
 const convert2 = new WpPostsConvert({
   type: WpPostsConvert.TYPE.CUSTOM,
   template: template2,
   target: '.js-wp-posts-2',
 });

// ヘルパー関数追加
// 数字を丸数字にするサンプル
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



