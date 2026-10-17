const { parseSpokenUrduPhoneNumber } = require('./phoneParser.js');

const tests = [
  '0308 48 15 900 پورا',
  '0308 48 15 900',
  'میرا نمبر ہے 0308 48 15 900',
  'zero teeno so ath, artali pandra no so',
  'صفر تین سو آٹھ اڑتالیس پندرہ نو سو پورا',
  '+92 308 4815900',
  '0300 1234567',
  'zero three zero eight four eight one five nine zero zero',
  '0300-1234567'
];

tests.forEach((t, i) => {
  const parsed = parseSpokenUrduPhoneNumber(t);
  console.log(`Test ${i+1}: "${t}" => ${parsed}`);
});
