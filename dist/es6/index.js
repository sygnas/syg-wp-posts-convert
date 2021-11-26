import { defineProperty as _defineProperty, createClass as _createClass, classCallCheck as _classCallCheck, toConsumableArray as _toConsumableArray } from './_virtual/_rollupPluginBabelHelpers.js';
import axios from 'axios';
import { parse } from 'csv-parse/dist/esm/sync';
import convertRestToNormal from './convertRestToNormal.js';
import convertCustomToNormal from './convertCustomToNormal.js';
import removeTag from './helpers/removeTag.js';
import convertDate from './helpers/convertDate.js';

var HELPER_REG = new RegExp("{{{(.+?)\\((.*?)\\)}}}", "m"); // 繰り返し処理のパターン

var LOOP_REG = new RegExp("{{#loop (.+?)}}([\\s\\S]+?){{\\/#loop}}", "m");
/**
 *
 */

var WpPostsConvert = /*#__PURE__*/function () {
  // 設定

  /**
   * コンストラクタ
   * @param {Object} option 設定。const defaults 参照
   */
  function WpPostsConvert() {
    var option = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, WpPostsConvert);

    _defineProperty(this, "opt", void 0);

    // 初期設定
    var defaults = {
      // 取得元タイプ
      // rest : WP REST API を使った取得（デフォルト）
      // custom : 添付の page-newslist.php を使った方法
      type: WpPostsConvert.TYPE.REST,
      // 表示テンプレート
      template: '<li><a href="{{link}}">{{title}}</a></li>',
      // 出力先のDOMセレクター
      target: ".js-wp-posts",
      // ヘルパー関数
      helpers: {
        removeTag: removeTag,
        convertDate: convertDate
      }
    }; // 設定をマージ

    this.opt = Object.assign(defaults, option);
  }
  /**
   * json を読み込んでテンプレートを展開する
   * @param {String} url json取得URL
   * @return {Promise} 成功・失敗を返す。成功時には変換したリストを一緒に返す
   */


  _createClass(WpPostsConvert, [{
    key: "start",
    value: function start(url) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        // jsonを読み込む
        axios.get(url).then(function (res) {
          // 受け取った記事一覧を変換し、
          // 指定されたエレメントに埋め込む
          var list = _this.convertList(res.data);

          _this.insertToTarget(list.join("")); // Promiseで変換済みリストを返す


          resolve(list);
        })["catch"](function (e) {
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
    key: "addHelper",
    value: function addHelper(name, func) {
      if (!this.opt.helpers) this.opt.helpers = {};
      this.opt.helpers[name] = func;
    }
    /**
     * private
     */

    /**
     * WordpressからREST APIで受け取った記事リストを変換して返す
     * @param {Array} data WP_postの配列
     * @return {Array} 変換した記事毎の配列
     */

  }, {
    key: "convertList",
    value: function convertList(data) {
      var _this2 = this;

      var output_list = [];
      data.forEach(function (post) {
        var wpData; // REST API方式、カスタム方式の差異を吸収する

        if (_this2.opt.type === WpPostsConvert.TYPE.REST) {
          wpData = convertRestToNormal(post);
        } else {
          wpData = convertCustomToNormal(post);
        } // テンプレートを適用


        var result = _this2.convertPost(wpData);

        output_list.push(result);
      });
      return output_list;
    }
    /**
     * 受け取った記事をテンプレートで変換して返す
     * @param {TWpData} post
     * @return {String} 変換したテンプレート
     */

  }, {
    key: "convertPost",
    value: function convertPost(post) {
      var template = this.opt.template || ""; // ヘルパーでの変換

      template = this.convertHelper(template, post); // 繰り返し項目の変換

      template = this.convertLoop(template, post); // 記事の項目で検索して変換

      template = this.convertSimple(template, post);
      return template;
    }
    /**
     * ヘルパー指定されたパターンからヘルパー名とパラメーターを抜き出して実行する
     * @param {String} template テンプレート
     * @param {Object} post ポストデータ
     * @return {String} 変換後テンプレート
     */

  }, {
    key: "convertHelper",
    value: function convertHelper(template, post) {
      /*
      HELPER_REG の中身 RegExp("{{{(.+?)\\((.*?)\\)}}}")
      対象例：{{{convert_date("date","YY年MM月DD日")}}}
           match[0] の内容 {{{convert_date("date","YY年MM月DD日")}}}
      match[1] の内容 convert_date
      match[2] の内容 "date","YY年MM月DD日"
       */
      var helpers = this.opt.helpers;
      var match;

      while ((match = HELPER_REG.exec(template)) !== null) {
        // 検索パターン
        var pattern = match[0]; // ヘルパー関数名

        var helperName = match[1]; // ヘルパーに渡す引数（csv文字列）を配列に分解

        var params = parse(match[2], {
          columns: false
        })[0]; // ヘルパーの実行結果で置換する

        if (helpers && helpers[helperName]) {
          var result = helpers[helperName].apply(helpers, [post].concat(_toConsumableArray(params)));
          template = template.replace(pattern, result);
        }
      }

      return template;
    }
    /**
     * 繰り返し項目の変換
     * カテゴリー処理用
     * データの取得が1階層目なので（post[key]）ACF内の配列を処理することが出来ない
     * ACFの内容で繰り返し処理をするならヘルパー関数で。
     * @param {String} template テンプレート
     * @param {Object} post ポストデータ
     * @return {String} 変換後テンプレート
     */

  }, {
    key: "convertLoop",
    value: function convertLoop(template, post) {
      var _this3 = this;

      /*
      LOOP_REG の内容
      LOOP_REG = RegExp('{{#loop (.+?)}}([\\s\\S]+?){{\\/#loop}}', 'm');
           例：カテゴリーを処理
      {{#loop categories}}
      <a href="{{link}}" class="{{slug}}">{{name}}</a>
      {{/#loop}}
           match[0] にはテンプレートの置き換え対象部分が入る
      {{#loop categories}}
      <a href="{{link}}" class="{{slug}}">{{name}}</a>
      {{/#loop}}
           match[1] には対象項目が入る。例では「categories」
      match[2] にはテンプレートが入る。例では「<a href="{{link}}" class="{{slug}}">{{name}}</a>」
      */
      var match;

      var _loop = function _loop() {
        // 置き換え対象部分
        var pattern = match[0]; // Wordpressのデータの該当要素。例なら categories の配列
        // keyof について https://zenn.dev/katoaki/articles/37a8cff3a8a32a
        // https://kodak.hatenablog.com/entry/2021/05/26/124807

        var key = match[1];
        var datalist = post[key]; // 変換テンプレート

        var format = match[2]; // 出力リスト

        var output = [];
        datalist.forEach(function (data) {
          output.push(_this3.convertSimple(format, data));
        });
        template = template.replace(pattern, output.join(""));
      };

      while ((match = LOOP_REG.exec(template)) !== null) {
        _loop();
      }

      return template;
    }
    /**
     * 記事データの項目名で置換
     * データの取得が1階層目なので（post[key]）ACF内の内容を処理することが出来ない
     * ACFを処理をするならヘルパー関数で。
     * @param {String} template テンプレート
     * @param {Object} post ポストデータ
     * @return {String} 変換後テンプレート
     */

  }, {
    key: "convertSimple",
    value: function convertSimple(template, post) {
      Object.keys(post).forEach(function (key) {
        template = template.replace("{{".concat(key, "}}"), post[key]);
      });
      return template;
    }
    /**
     * 変換したテンプレートをターゲットエレメントに挿入する
     * エレメントが存在しなければ何もしない
     * @param {String} output 変換済みテンプレート
     */

  }, {
    key: "insertToTarget",
    value: function insertToTarget(output) {
      if (!this.opt.target) {
        throw "オプション target が指定されていません";
      }

      var target = document.querySelector(this.opt.target);

      if (target) {
        target.insertAdjacentHTML("afterbegin", output);
      } else {
        throw "\u633F\u5165\u5148 ".concat(this.opt.target, " \u304C\u5B58\u5728\u3057\u307E\u305B\u3093");
      }
    }
  }]);

  return WpPostsConvert;
}();

_defineProperty(WpPostsConvert, "TYPE", {
  REST: "rest",
  CUSTOM: "custom"
});

export { WpPostsConvert as default };
//# sourceMappingURL=index.js.map
