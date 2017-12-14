
import Wp_posts_convert from '../../dist/syg-wp-posts-convert.es';
// import wp_posts_convert from 'syg-wp-posts-convert';


// --------------
// シンプルなリスト
// --------------
const wp_posts1 = new Wp_posts_convert({
    template: document.querySelector('.js-wp-posts-template-1').textContent
});
wp_posts1.start('./sample.json');




// --------------
// オプションを指定
// --------------
// 変換結果の配列も別途受け取る
const wp_posts2 = new Wp_posts_convert({
    template: document.querySelector('.js-wp-posts-template-2').textContent,
    target: '.js-wp-posts-2'
});
// ヘルパー関数追加
// 数字を漢字にするサンプル
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

wp_posts2.start('./sample.json')
.then(function(list) {
    console.log("変換したものを配列で受け取る");
    console.log(list);
});



