const axios = require('axios');

async function testSpokenNumberFlow() {
  console.log('=== SPOKEN NUMBER END-TO-END TEST ===\n');

  // Turn 1: Order trigger
  let res = await axios.post('http://localhost:5000/api/chat', {
    prompt: 'sarsabz urea k 10 bag chahie',
    orderState: null
  });
  console.log('Bot Turn 1:\n', res.data.text, '\n');
  let state = res.data.orderState;

  // Turn 2: Name
  res = await axios.post('http://localhost:5000/api/chat', {
    prompt: 'Ali Raza',
    orderState: state
  });
  console.log('Bot Turn 2:\n', res.data.text, '\n');
  state = res.data.orderState;

  // Turn 3: District
  res = await axios.post('http://localhost:5000/api/chat', {
    prompt: 'Khanewal',
    orderState: state
  });
  console.log('Bot Turn 3:\n', res.data.text, '\n');
  state = res.data.orderState;

  // Turn 4: Spoken phone number in Urdu words (User's Exact Example!)
  console.log('👤 Farmer Speaks Phone: "zero teeno so ath, artali pandra no so"');
  res = await axios.post('http://localhost:5000/api/chat', {
    prompt: 'zero teeno so ath, artali pandra no so',
    orderState: state
  });
  console.log('Bot Turn 4:\n', res.data.text);
  console.log('📌 Captured Phone in State:', res.data.orderState.phone, '\n');
  state = res.data.orderState;

  // Turn 5: Payment
  res = await axios.post('http://localhost:5000/api/chat', {
    prompt: 'fasalpay',
    orderState: state
  });
  console.log('Bot Turn 5 (Final Confirmation):\n', res.data.text);
  console.log('\n🎉 Final Stored Order in Database:', res.data.order);
}

testSpokenNumberFlow();
