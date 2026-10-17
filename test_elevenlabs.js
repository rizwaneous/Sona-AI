const axios = require('axios');

async function testElevenLabsTTS() {
  console.log('Testing ElevenLabs TTS endpoint on localhost:5000...');
  try {
    const res = await axios.post('http://localhost:5000/api/tts', {
      text: 'شکریہ! فاطمہ فرٹیلائزر سرسبز آپ کی خدمت میں حاضر ہے۔'
    }, {
      responseType: 'arraybuffer'
    });
    console.log('Status:', res.status);
    console.log('Content-Type:', res.headers['content-type']);
    console.log('Audio Buffer Size (Bytes):', res.data.length);
    if (res.data.length > 1000) {
      console.log('✅ ElevenLabs Audio Generation Successful!');
    }
  } catch (err) {
    console.error('TTS Error:', err.message);
  }
}

testElevenLabsTTS();
