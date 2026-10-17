const axios = require('axios');

async function testSlotFillingDialogue() {
  console.log('=== MULTI-TURN CONVERSATIONAL ORDER TEST ===\n');

  let orderState = null;

  // Turn 1: Request
  console.log('👤 Farmer Turn 1: مجھے 10 بوری سرسبز کین گوارا چاہیے');
  let res = await axios.post('http://localhost:5000/api/chat', {
    prompt: 'مجھے 10 بوری سرسبز کین گوارا چاہیے',
    orderState: orderState
  });
  orderState = res.data.orderState;
  console.log('🤖 Sarsabz AI:', res.data.text);
  console.log('📌 State Step:', orderState ? orderState.step : 'null', '\n');

  // Turn 2: Name
  console.log('👤 Farmer Turn 2: میرا نام محمد اسلم خان ہے');
  res = await axios.post('http://localhost:5000/api/chat', {
    prompt: 'میرا نام محمد اسلم خان ہے',
    orderState: orderState
  });
  orderState = res.data.orderState;
  console.log('🤖 Sarsabz AI:', res.data.text);
  console.log('📌 State Step:', orderState ? orderState.step : 'null', 'Captured Name:', orderState ? orderState.farmerName : 'null', '\n');

  // Turn 3: District / Address
  console.log('👤 Farmer Turn 3: ضلع خانیوال تحصیل جہانیاں');
  res = await axios.post('http://localhost:5000/api/chat', {
    prompt: 'ضلع خانیوال تحصیل جہانیاں',
    orderState: orderState
  });
  orderState = res.data.orderState;
  console.log('🤖 Sarsabz AI:', res.data.text);
  console.log('📌 State Step:', orderState ? orderState.step : 'null', 'Captured Address:', orderState ? orderState.district : 'null', '\n');

  // Turn 4: Phone
  console.log('👤 Farmer Turn 4: 03001234567');
  res = await axios.post('http://localhost:5000/api/chat', {
    prompt: '03001234567',
    orderState: orderState
  });
  orderState = res.data.orderState;
  console.log('🤖 Sarsabz AI:', res.data.text);
  console.log('📌 State Step:', orderState ? orderState.step : 'null', 'Captured Phone:', orderState ? orderState.phone : 'null', '\n');

  // Turn 5: Payment Method
  console.log('👤 Farmer Turn 5: فصل پے قرضہ');
  res = await axios.post('http://localhost:5000/api/chat', {
    prompt: 'فصل پے قرضہ',
    orderState: orderState
  });
  console.log('🤖 Sarsabz AI:', res.data.text);
  console.log('\n🎉 Final Order Object in DB:', res.data.order);
}

testSlotFillingDialogue();
