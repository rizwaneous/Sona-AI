const axios = require('axios');

async function testScreenshot24Bags() {
  console.log('--- TEST: Screenshot Prompt: "مجھے 24 بوریاں چاہیے یوریا کھاد کی" ---');
  
  // Test 1: Triggered fresh
  let res = await axios.post('http://localhost:5000/api/chat', {
    prompt: 'مجھے 24 بوریاں چاہیے یوریا کھاد کی',
    orderState: null
  });
  console.log('Response (Fresh Trigger):\n', res.data.text);
  console.log('Step:', res.data.orderState.step);

  // Test 2: Triggered even if client had a previous stale state
  let staleRes = await axios.post('http://localhost:5000/api/chat', {
    prompt: 'مجھے 24 بوریاں چاہیے یوریا کھاد کی',
    orderState: { step: 'COLLECTING_NAME' }
  });
  console.log('\nResponse (Stale State Override):\n', staleRes.data.text);
  console.log('Step:', staleRes.data.orderState.step);
}

testScreenshot24Bags();
