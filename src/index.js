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

import axios from 'axios';
import Parser from 'csv-string/lib/parser';

// ヘルパー
import convert_date from './helpers/convert_date';
import remove_tag from './helpers/remove_tag';


// ヘルパー関数を使った置き換えのパターン
const helper_reg = new RegExp('{{{(.+?)\\((.*?)\\)}}}');

// 繰り返し処理のパターン
const loop_reg = new RegExp('{{#loop (.+?)}}([\\s\\S]+?){{\\/#loop}}', 'm');

/**
 *
 */

export default class {

  /**
   * コンストラクタ
   * @param {Object} config 設定。const defaults 参照
   */
  constructor(config) {
    // 初期設定
    const defaults = {
      // 表示テンプレート
      template: '<li><a href="{{permalink}}">{{post_title}}</a></li>',
      // 出力先のDOMセレクター
      target: '.js-wp-posts',
      // ヘルパー関数
      helpers: {
        remove_tag,
        convert_date
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
  start(url) {
    return new Promise((resolve, reject) => {
      // jsonを読み込む
      axios.get(url)
        .then((res) => {
          // 受け取った記事一覧を変換し、
          // 指定されたエレメントに埋め込む
          const list = this.$_convert_list(res.data);
          this.$_insert_to_target(list.join(''));

          // Promiseで変換済みリストを返す
          resolve(list);
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * ヘルパー関数を追加
   * @param {String} name 関数名
   * @param {Function} func 関数
   */
  add_helper(name, func) {
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
  $_insert_to_target(output) {
    const target = document.querySelector(this.opt.target);
    if (target) {
      target.insertAdjacentHTML('afterbegin', output);
    }
  }

  /**
   * 受け取った記事リストを変換して返す
   * @param {Array} data WP_postの配列
   * @return {Array} 変換した記事毎の配列
   */
  $_convert_list(data) {
    const output_list = [];
    // console.log(data);

    data.forEach((post) => {
      const result = this.$_convert_post(post);
      output_list.push(result);
    });
    return output_list;
  }

  /**
   * 受け取った記事をテンプレートで変換して返す
   * @param {Object} post
   * @return {String} 変換したテンプレート
   */
  $_convert_post(post) {
    let template = this.opt.template;

    // ヘルパーでの変換
    template = this.$_convert_helper(template, post);
    // 繰り返し項目の変換
    template = this.$_convert_loop(template, post);
    // 記事の項目で検索して変換
    template = this.$_convert_simple(template, post);

    return template;
  }

  /**
   * 繰り返し項目の変換
   * @param {String} template テンプレート
   * @param {Object} post ポストデータ
   * @return {String} 変換後テンプレート
   */
  $_convert_loop(template, post) {
    let match;

    while ((match = loop_reg.exec(template)) !== null) {
      // 検索パターン
      const pattern = match[0];
      // ループ用配列
      const datalist = post[match[1]];
      // 変換フォーマット
      const format = match[2];
      // 出力リスト
      const output = [];

      datalist.forEach((data) => {
        output.push(this.$_convert_simple(format, data));
      });
      template = template.replace(pattern, output.join(''));
    }
    return template;
  }

  /**
   * 記事データの項目名で置換
   * @param {String} template テンプレート
   * @param {Object} post ポストデータ
   * @return {String} 変換後テンプレート
   */
  $_convert_simple(template, post) {
    Object.keys(post).forEach((key) => {
      template = template.replace(`{{${key}}}`, post[key]);
    });
    return template;
  }

  /**
   * ヘルパー指定されたパターンからヘルパー名とパラメーターを抜き出して実行する
   * @param {String} template テンプレート
   * @param {Object} post ポストデータ
   * @return {String} 変換後テンプレート
   */
  $_convert_helper(template, post) {
    const helpers = this.opt.helpers;
    let match;

    while ((match = helper_reg.exec(template)) !== null) {
      // 検索パターン
      const pattern = match[0];
      // ヘルパー関数名
      const helper = match[1];
      const parser = new Parser(match[2]);
      // ヘルパーに渡す引数
      const params = parser.File()[0];
      // ヘルパーの実行結果で置換する
      const helper_res = helpers[helper](post, ...params);
      template = template.replace(pattern, helper_res);
    }
    return template;
  }
}
