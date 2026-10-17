const axios = require('axios');

async function testAdvisoryVsOrder() {
  console.log('=== TEST 1: Advisory Query ("میری پانچ ایکڑ فصل پہ کتنا سرسبز یوریا لگے گا") ===');
  let res = await axios.post('http://localhost:5000/api/chat', {
    prompt: 'میری پانچ ایکڑ فصل پہ کتنا سرسبز یوریا لگے گا',
    orderState: null
  });
  console.log('Bot Response:\n', res.data.text);
  console.log('Order Triggered?:', res.data.orderState ? 'YES (BUG)' : 'NO (CORRECT ADVISORY!)');
  console.log('Provider:', res.data.provider);

  console.log('\n=== TEST 2: Comparison Question ("کین گوارا اور عام یوریا میں کیا فرق ہے") ===');
  res = await axios.post('http://localhost:5000/api/chat', {
    prompt: 'کین گوارا اور عام یوریا میں کیا فرق ہے',
    orderState: null
  });
  console.log('Bot Response:\n', res.data.text);
  console.log('Order Triggered?:', res.data.orderState ? 'YES (BUG)' : 'NO (CORRECT ADVISORY!)');

  console.log('\n=== TEST 3: Explicit Order Trigger ("مجھے 24 بوری یوریا کا آرڈر کرنا ہے") ===');
  res = await axios.post('http://localhost:5000/api/chat', {
    prompt: 'مجھے 24 بوری یوریا کا آرڈر کرنا ہے',
    orderState: null
  });
  console.log('Bot Response:\n', res.data.text);
  console.log('Order Triggered?:', res.data.orderState ? 'YES (CORRECT ORDER!)' : 'NO (BUG)');
  console.log('Captured Step:', res.data.orderState ? res.data.orderState.step : 'null');
}

testAdvisoryVsOrder();
