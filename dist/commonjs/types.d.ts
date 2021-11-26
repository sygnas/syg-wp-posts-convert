declare type TOption = {
    type?: 'rest' | 'custom';
    template?: string;
    target?: string;
    helpers?: {
        [key: string]: THelperFunction;
    };
};
declare type TWpCustomCategory = {
    name: string;
    slug: string;
    link?: string;
};
declare type TWpCustomData = {
    ID: number;
    post_date: string;
    post_title: string;
    link: string;
    acf: object;
    categories: TWpCustomCategory[];
    eyecatch: string;
};
declare type TWpRestApiData = {
    id: number;
    date: string;
    title: {
        rendered: string;
    };
    link: string;
    acf?: any[];
    cat_info?: TWpCustomCategory[];
    _embedded?: {
        'wp:featuredmedia': [
            {
                media_details: {
                    sizes: {
                        medium: {
                            source_url: string;
                        };
                    };
                };
            }
        ];
    };
};
declare type TWpData = {
    id: number;
    date: string;
    title: string;
    link: string;
    eyecatch: string;
    acf: object;
    categories: TWpCustomCategory[];
};
declare type TObject = {
    [key: string]: any;
};
declare type THelperFunction = (post: TWpData, ...args: any) => string;
export type { TOption, TWpCustomCategory, TWpCustomData, TWpRestApiData, TWpData, TObject, THelperFunction };
