/**
 * Wordpress get_posts() json to html convert.
 * Wordpress の get_posts() の json を html に変換する。
 * htmlテンプレートには Handlebarsを使用
 *
 * カテゴリ情報は本来 REST API で取得するデータには含まれないので、
 * Wordpress テンプレートの functions.php に追加の記述が必要。
 * 詳細は README.md 参照。
 *
 *
 * @author   Hiroshi Fukuda <info.sygnas@gmail.com>
 * @license  MIT
 */

/* eslint no-console: off */
/* eslint no-unused-vars: off */

import axios, { AxiosResponse } from "axios";
import { parse } from "csv-parse/dist/esm/sync";
import {
  TOption,
  TWpCustomData,
  TWpRestApiData,
  TWpData,
  TObject,
  THelperFunction,
  TWpCustomCategory,
} from "./types";
import convertRestToNormal from "./convertRestToNormal";
import convertCustomToNormal from "./convertCustomToNormal";

// ヘルパー
import removeTag from "./helpers/removeTag";
import convertDate from "./helpers/convertDate.js";

// ヘルパー関数を使った置き換えのパターン
const HELPER_REG: RegExp = new RegExp("{{{(.+?)\\((.*?)\\)}}}", "mg");
// 繰り返し処理のパターン
const LOOP_REG: RegExp = new RegExp("{{#loop (.+?)}}([\\s\\S]+?){{\\/#loop}}",　"mg");

/**
 *
 */

class WpPostsConvert {
  public static TYPE: { [key: string]: "rest" | "custom" } = {
    REST: "rest",
    CUSTOM: "custom",
  };

  // 設定
  private opt: TOption;

  /**
   * コンストラクタ
   * @param {Object} option 設定。const defaults 参照
   */
  constructor(option: TOption = {}) {
    // 初期設定
    const defaults: TOption = {
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
        removeTag,
        convertDate,
      },
    };

    // 設定をマージ
    this.opt = Object.assign(defaults, option);
  }

  /**
   * json を読み込んでテンプレートを展開する
   * @param {String} url json取得URL
   * @return {Promise} 成功・失敗を返す。成功時には変換したリストを一緒に返す
   */
  start(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      // jsonを読み込む
      axios
        .get(url)
        .then((res: AxiosResponse) => {
          // 受け取った記事一覧を変換し、
          // 指定されたエレメントに埋め込む
          const list = this.convertList(res.data);
          this.insertToTarget(list.join(""));

          // Promiseで変換済みリストを返す
          resolve(list);
        })
        .catch((e: Error) => {
          reject(e);
        });
    });
  }

  /**
   * ヘルパー関数を追加
   * @param {String} name 関数名
   * @param {Function} func 関数
   */
  addHelper(name: string, func: THelperFunction ): void {
    if(!this.opt.helpers) this.opt.helpers = {};
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
  private convertList(data: object[]): string[] {
    const output_list: string[] = [];

    data.forEach((post: object) => {
      let wpData: TWpData;

      // REST API方式、カスタム方式の差異を吸収する
      if (this.opt.type === WpPostsConvert.TYPE.REST) {
        wpData = convertRestToNormal(post as TWpRestApiData);
      } else {
        wpData = convertCustomToNormal(post as TWpCustomData);
      }

      // テンプレートを適用
      const result: string = this.convertPost(wpData);
      output_list.push(result);
    });
    return output_list;
  }

  /**
   * 受け取った記事をテンプレートで変換して返す
   * @param {TWpData} post
   * @return {String} 変換したテンプレート
   */
  private convertPost(post: TWpData): string {
    let template: string = this.opt.template || "";

    // ヘルパーでの変換
    template = this.convertHelper(template, post);
    // 繰り返し項目の変換
    template = this.convertLoop(template, post);
    // 記事の項目で検索して変換
    template = this.convertSimple(template, post);

    return template;
  }

  /**
   * ヘルパー指定されたパターンからヘルパー名とパラメーターを抜き出して実行する
   * @param {String} template テンプレート
   * @param {Object} post ポストデータ
   * @return {String} 変換後テンプレート
   */
  convertHelper(template: string, post: TWpData) {
    /*
    HELPER_REG の中身 RegExp("{{{(.+?)\\((.*?)\\)}}}")
    対象例：{{{convert_date("date","YY年MM月DD日")}}}

    match[0] の内容 {{{convert_date("date","YY年MM月DD日")}}}
    match[1] の内容 convert_date
    match[2] の内容 "date","YY年MM月DD日"
     */
    const helpers = this.opt.helpers;
    let match;

    while ((match = HELPER_REG.exec(template)) !== null) {
      // 検索パターン
      const pattern = match[0];
      // ヘルパー関数名
      const helperName = match[1];
      // ヘルパーに渡す引数（csv文字列）を配列に分解
      const params = parse(match[2], {columns: false})[0] || [];
      // ヘルパーの実行結果で置換する
      if (helpers && helpers[helperName]){
        const result = helpers[helperName](post, ...params);
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
  private convertLoop(template: string, post: TWpData) {
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

    let match;

    while ((match = LOOP_REG.exec(template)) !== null) {
      // 置き換え対象部分
      const pattern: string = match[0];
      // Wordpressのデータの該当要素。例なら categories の配列
      // keyof について https://zenn.dev/katoaki/articles/37a8cff3a8a32a
      // https://kodak.hatenablog.com/entry/2021/05/26/124807
      const key: keyof TWpData = match[1] as keyof TWpData;
      const datalist = post[key] as TWpCustomCategory[];
      // 変換テンプレート
      const format: string = match[2];
      // 出力リスト
      const output: string[] = [];

      datalist.forEach((data: TWpCustomCategory) => {
        output.push(this.convertSimple(format, data));
      });
      template = template.replace(pattern, output.join(""));
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
  private convertSimple(template: string, post: TObject): string {
    Object.keys(post).forEach((key) => {
      template = template.replace(`{{${key}}}`, post[key]);
    });
    return template;
  }

  /**
   * 変換したテンプレートをターゲットエレメントに挿入する
   * エレメントが存在しなければ何もしない
   * @param {String} output 変換済みテンプレート
   */
  private insertToTarget(output: string): void {
    if (!this.opt.target) {
      throw "オプション target が指定されていません";
    }

    const target:HTMLElement = document.querySelector(this.opt.target) as HTMLElement;
    if (target) {
      target.insertAdjacentHTML("afterbegin", output);
    } else {
      throw `挿入先 ${this.opt.target} が存在しません`;
    }
  }
}

export default WpPostsConvert;
