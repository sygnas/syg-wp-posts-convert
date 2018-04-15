
// 日付書式変換
export default function convert_date (post, key, format) {

    const date = post[key].split(/[: -]/);
    const YY = date[0];
    const MM = date[1];
    const M = date[1].replace(/^0/, '');
    const DD = date[2];
    const D = date[2].replace(/^0/, '');
    const hh = date[3];
    const mm = date[4];

    let output = format;
    output = output.split('YY').join(YY);
    output = output.split('MM').join(MM);
    output = output.split('M').join(M);
    output = output.split('DD').join(DD);
    output = output.split('D').join(D);
    output = output.split('hh').join(hh);
    output = output.split('mm').join(mm);

    return output;
}
