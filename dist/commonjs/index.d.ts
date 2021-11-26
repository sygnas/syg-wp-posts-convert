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
import { TOption, TWpData, THelperFunction } from "./types";
/**
 *
 */
declare class WpPostsConvert {
    static TYPE: {
        [key: string]: "rest" | "custom";
    };
    private opt;
    /**
     * コンストラクタ
     * @param {Object} option 設定。const defaults 参照
     */
    constructor(option?: TOption);
    /**
     * json を読み込んでテンプレートを展開する
     * @param {String} url json取得URL
     * @return {Promise} 成功・失敗を返す。成功時には変換したリストを一緒に返す
     */
    start(url: string): Promise<any>;
    /**
     * ヘルパー関数を追加
     * @param {String} name 関数名
     * @param {Function} func 関数
     */
    addHelper(name: string, func: THelperFunction): void;
    /**
     * private
     */
    /**
     * WordpressからREST APIで受け取った記事リストを変換して返す
     * @param {Array} data WP_postの配列
     * @return {Array} 変換した記事毎の配列
     */
    private convertList;
    /**
     * 受け取った記事をテンプレートで変換して返す
     * @param {TWpData} post
     * @return {String} 変換したテンプレート
     */
    private convertPost;
    /**
     * ヘルパー指定されたパターンからヘルパー名とパラメーターを抜き出して実行する
     * @param {String} template テンプレート
     * @param {Object} post ポストデータ
     * @return {String} 変換後テンプレート
     */
    convertHelper(template: string, post: TWpData): string;
    /**
     * 繰り返し項目の変換
     * カテゴリー処理用
     * データの取得が1階層目なので（post[key]）ACF内の配列を処理することが出来ない
     * ACFの内容で繰り返し処理をするならヘルパー関数で。
     * @param {String} template テンプレート
     * @param {Object} post ポストデータ
     * @return {String} 変換後テンプレート
     */
    private convertLoop;
    /**
     * 記事データの項目名で置換
     * データの取得が1階層目なので（post[key]）ACF内の内容を処理することが出来ない
     * ACFを処理をするならヘルパー関数で。
     * @param {String} template テンプレート
     * @param {Object} post ポストデータ
     * @return {String} 変換後テンプレート
     */
    private convertSimple;
    /**
     * 変換したテンプレートをターゲットエレメントに挿入する
     * エレメントが存在しなければ何もしない
     * @param {String} output 変換済みテンプレート
     */
    private insertToTarget;
}
export default WpPostsConvert;
