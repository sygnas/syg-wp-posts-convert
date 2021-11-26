type TOption = {
  // 取得元タイプ
  // rest : WP REST API を使った取得（デフォルト）
  // custom : 添付の page-newslist.php を使った方法
  type?: 'rest' | 'custom',
  // 表示テンプレート
  template?: string,
  // 出力先のDOMセレクター
  target?: string,
  // ヘルパー関数
  helpers?: {[key: string]: THelperFunction}
};

// Wordpress のカテゴリー
type TWpCustomCategory = {
  name: string,
  slug: string,
  link?: string,
};

// Wordpress の page-newslist.php から受け取るデータ
type TWpCustomData = {
  ID: number,
  post_date: string,
  post_title: string,
  link: string,
  acf: object,
  categories: TWpCustomCategory[],
  eyecatch: string,
};

// Wordpress の REST API から受け取るデータ
// アイキャッチは取得URLに「&_embed」が必要
// カテゴリー cat_info は付属の wordpress/api_add_category.php が必要
type TWpRestApiData = {
  id: number,
  date: string,
  title: {
    rendered: string,
  },
  link: string,
  acf?: any[],
  cat_info?: TWpCustomCategory[],
  _embedded?: {
    'wp:featuredmedia': [
      {
        media_details: {
          sizes: {
            medium: {
              source_url: string,
            },
          },
        },
      },
    ],
  },
};

// TWpCustomData、TWpRestApiData から共通仕様に変換したもの
type TWpData = {
  id: number,
  date: string,
  title: string,
  link: string,
  eyecatch: string,
  acf: object,
  categories: TWpCustomCategory[],
}

type TObject = {
  [key: string]: any
};

// Worpressデータのいずれかの繰り返し要素
// type TWpLoopItem = string | {[key: string]: string};
// type TWpLoopData = TWpLoopItem[];

// ヘルパー関数
type THelperFunction = (post: TWpData, ...args: any) => string;

export type { TOption, TWpCustomCategory, TWpCustomData, TWpRestApiData, TWpData, TObject, THelperFunction };
