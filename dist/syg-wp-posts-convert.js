(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('axios'), require('csv-string/lib/parser')) :
	typeof define === 'function' && define.amd ? define(['axios', 'csv-string/lib/parser'], factory) :
	(global['syg-wp-posts-convert'] = factory(global.axios,global.Parser));
}(this, (function (axios,Parser) { 'use strict';

axios = axios && axios.hasOwnProperty('default') ? axios['default'] : axios;
Parser = Parser && Parser.hasOwnProperty('default') ? Parser['default'] : Parser;

// 日付書式変換
function convert_date(post, key, format) {

    var date = post[key].split(/[: -]/);
    var YY = date[0];
    var MM = date[1];
    var DD = date[2];
    var hh = date[3];
    var mm = date[4];

    var output = format;
    output = output.split('YY').join(YY);
    output = output.split('MM').join(MM);
    output = output.split('DD').join(DD);
    output = output.split('hh').join(hh);
    output = output.split('mm').join(mm);

    return output;
}

// タグ除去
function remove_tag(post, key) {

    return post[key].replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, '');
}

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Wordpress get_posts() json to html convert.
 * Wordpress の get_posts() の json を html に変換する。
 * htmlテンプレートには Handlebarsを使用
 *
 * @author   Hiroshi Fukuda <info.sygnas@gmail.com>
 * @license  MIT
 */

/* eslint no-console: off */
/* eslint no-unused-vars: off */

// ヘルパー
// ヘルパー関数を使った置き換えのパターン
var helper_reg = new RegExp('{{{(.+?)\\((.*?)\\)}}}');

/**
 *
 */

var _class = function () {

    /**
     * コンストラクタ
     * @param {Object} config 設定。const defaults 参照
     */
    function _class(config) {
        _classCallCheck(this, _class);

        // 初期設定
        var defaults = {
            // 表示テンプレート
            template: '<li><a href="{{permalink}}">{{post_title}}</a></li>',
            // 出力先のDOMセレクター
            target: '.js-wp-posts',
            // ヘルパー関数
            helpers: {
                remove_tag: remove_tag,
                convert_date: convert_date
            }
        };

        // 設定をマージ
        this.opt = Object.assign(defaults, config);
    }

    /**
     * json を読み込んでテンプレートを展開する
     * @param {String} url json取得URL
     * @return {Promise} 成功・失敗を返す。成功時には変換したリストを一緒に返す
     */


    _createClass(_class, [{
        key: 'start',
        value: function start(url) {
            var _this = this;

            return new Promise(function (resolve, reject) {
                // jsonを読み込む
                axios.get(url).then(function (res) {
                    // 受け取った記事一覧を変換し、
                    // 指定されたエレメントに埋め込む
                    var list = _this.$_convert_list(res.data);
                    _this.$_insert_to_target(list.join(''));

                    // Promiseで変換済みリストを返す
                    resolve(list);
                }).catch(function (e) {
                    reject(e);
                });
            });
        }

        /**
         * ヘルパー関数を追加
         * @param {String} name 関数名
         * @param {Function} func 関数
         */

    }, {
        key: 'add_helper',
        value: function add_helper(name, func) {
            this.opt.helpers[name] = func;
        }

        /**
         * private
         */

        /**
         * 変換したテンプレートをターゲットエレメントに挿入する
         * エレメントが存在しなければ何もしない
         * @param {String} output 変換済みテンプレート
         */

    }, {
        key: '$_insert_to_target',
        value: function $_insert_to_target(output) {
            var target = document.querySelector(this.opt.target);
            if (target) {
                target.insertAdjacentHTML('afterbegin', output);
            }
        }

        /**
         * 受け取った記事リストを変換して返す
         * @param {Array} data WP_postの配列
         * @return {Array} 変換した記事毎の配列
         */

    }, {
        key: '$_convert_list',
        value: function $_convert_list(data) {
            var _this2 = this;

            var output_list = [];
            // console.log(data);

            data.forEach(function (post) {
                var result = _this2.$_convert_post(post);
                output_list.push(result);
            });
            return output_list;
        }

        /**
         * 受け取った記事をテンプレートで変換して返す
         * @param {Object} post
         * @return {String} 変換したテンプレート
         */

    }, {
        key: '$_convert_post',
        value: function $_convert_post(post) {
            var template = this.opt.template;

            // ヘルパーでの置き換えを処理
            template = this.$_convert_helper(template, post);
            // 記事の項目で検索して書き換え
            template = this.$_convert_simple(template, post);

            return template;
        }

        /**
         * 記事データの項目名で置換
         * @param {String} template テンプレート
         * @param {Object} post ポストデータ
         * @return {String} 変換後テンプレート
         */

    }, {
        key: '$_convert_simple',
        value: function $_convert_simple(template, post) {
            Object.keys(post).forEach(function (key) {
                template = template.replace('{{' + key + '}}', post[key]);
            });
            return template;
        }

        /**
         * ヘルパー指定されたパターンからヘルパー名とパラメーターを抜き出して実行する
         * @param {String} template テンプレート
         * @param {Object} post ポストデータ
         * @return {String} 変換後テンプレート
         */

    }, {
        key: '$_convert_helper',
        value: function $_convert_helper(template, post) {
            var helpers = this.opt.helpers;
            var match = void 0;

            while ((match = helper_reg.exec(template)) !== null) {
                // 検索パターン
                var pattern = match[0];
                // ヘルパー関数名
                var helper = match[1];
                var parser = new Parser(match[2]);
                // ヘルパーに渡す引数
                var params = parser.File()[0];
                // ヘルパーの実行結果で置換する
                var helper_res = helpers[helper].apply(helpers, [post].concat(_toConsumableArray(params)));
                template = template.replace(pattern, helper_res);
            }
            return template;
        }
    }]);

    return _class;
}();

return _class;

})));
//# sourceMappingURL=syg-wp-posts-convert.js.map
