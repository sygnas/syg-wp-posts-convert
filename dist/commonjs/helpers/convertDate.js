'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

// 日付書式変換
function convertDate(post, key, format) {
  var date = post[key];
  var dateArray = date.split(/[T: -]/);
  var YY = dateArray[0];
  var MM = dateArray[1];
  var M = dateArray[1].replace(/^0/, '');
  var DD = dateArray[2];
  var D = dateArray[2].replace(/^0/, '');
  var hh = dateArray[3];
  var mm = dateArray[4];
  var output = format;
  output = output.split('YY').join(YY);
  output = output.split('MM').join(MM);
  output = output.split('M').join(M);
  output = output.split('DD').join(DD);
  output = output.split('D').join(D);
  output = output.split('hh').join(hh);
  output = output.split('mm').join(mm);
  return output;
}

exports["default"] = convertDate;
//# sourceMappingURL=convertDate.js.map
