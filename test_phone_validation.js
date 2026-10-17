const axios = require('axios');

async function testPhoneFlow() {
  console.log('=== TEST 1: Incomplete Number ("0308") ===');
  let res1 = await axios.post('http://localhost:5000/api/chat', {
    prompt: '0308',
    orderState: { step: 'COLLECTING_PHONE', farmerName: 'Aslam', items: '10 bori' }
  });
  console.log('Bot Response:\n', res1.data.text);
  console.log('Step (Must stay COLLECTING_PHONE):', res1.data.orderState.step);

  console.log('\n=== TEST 2: Full Spoken Number ("zero teen so ath, artali pandra no so") ===');
  let res2 = await axios.post('http://localhost:5000/api/chat', {
    prompt: 'zero teen so ath, artali pandra no so',
    orderState: { step: 'COLLECTING_PHONE', farmerName: 'Aslam', items: '10 bori' }
  });
  console.log('Bot Response:\n', res2.data.text);
  console.log('Captured Phone:', res2.data.orderState.phone);
  console.log('Step (Must be COLLECTING_PAYMENT):', res2.data.orderState.step);

  console.log('\n=== TEST 3: Full Typed Number ("0308 4815900") ===');
  let res3 = await axios.post('http://localhost:5000/api/chat', {
    prompt: '0308 4815900',
    orderState: { step: 'COLLECTING_PHONE', farmerName: 'Aslam', items: '10 bori' }
  });
  console.log('Bot Response:\n', res3.data.text);
  console.log('Captured Phone:', res3.data.orderState.phone);
  console.log('Step (Must be COLLECTING_PAYMENT):', res3.data.orderState.step);
}

testPhoneFlow();
