import { TWpData } from "../types";


// 日付書式変換
export default function convertDate (post: TWpData, format: string): string {

    const date: string = post.date as string;
    const dateArray: string[] = date.split(/[T: -]/);
    const YY: string = dateArray[0];
    const MM: string = dateArray[1];
    const M: string = dateArray[1].replace(/^0/, '');
    const DD: string = dateArray[2];
    const D: string = dateArray[2].replace(/^0/, '');
    const hh: string = dateArray[3];
    const mm: string = dateArray[4];

    let output: string = format;
    output = output.split('YY').join(YY);
    output = output.split('MM').join(MM);
    output = output.split('M').join(M);
    output = output.split('DD').join(DD);
    output = output.split('D').join(D);
    output = output.split('hh').join(hh);
    output = output.split('mm').join(mm);

    return output;
}
