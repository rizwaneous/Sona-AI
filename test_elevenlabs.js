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
    console.log('Voice provider:', res.headers['x-tts-provider'] || 'unknown');
    console.log('Audio Buffer Size (Bytes):', res.data.length);
    if (res.data.length > 1000 && res.headers['x-tts-provider']?.startsWith('elevenlabs-')) {
      console.log('✅ ElevenLabs Audio Generation Successful!');
    } else {
      throw new Error('ElevenLabs was not used; a fallback or invalid audio was returned');
    }
  } catch (err) {
    console.error('TTS Error:', err.message);
    process.exitCode = 1;
  }
}

testElevenLabsTTS();
