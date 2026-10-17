const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { test } = require('node:test');
const source = fs.readFileSync(require.resolve('./server'), 'utf8');
const speechSource = source.slice(source.indexOf('async function generateUrduSpeechAudio('), source.indexOf("app.post('/api/tts'"));

function loadSpeech(env, post, get = async () => ({ data: Buffer.alloc(700) })) {
  const logs = [];
  const context = vm.createContext({
    process: { env }, Buffer, DISABLE_ELEVENLABS: false,
    convertNumbersToUrduWords: text => text,
    axios: { post, get },
    console: { log: (...args) => logs.push(args.join(' ')), warn: (...args) => logs.push(args.join(' ')) }
  });
  vm.runInContext(speechSource, context);
  return { generate: context.generateUrduSpeechAudio, logs };
}

test('primary key generates Urdu with v3 without deprecated latency option', async () => {
  const { generate, logs } = loadSpeech({ ELEVENLABS_API_KEY: ' primary-secret ' }, async (url, body, options) => {
    assert(!url.includes('optimize_streaming_latency'));
    assert.equal(body.model_id, 'eleven_v3');
    assert.equal(body.language_code, 'ur');
    assert.equal(body.voice_settings.stability, 0.5);
    assert.equal(options.headers['xi-api-key'], 'primary-secret');
    return { data: Buffer.alloc(1000) };
  });
  const result = await generate('السلام علیکم');
  assert.equal(result.provider, 'elevenlabs-primary');
  assert.equal(result.audio.length, 1000);
  assert(!logs.join(' ').includes('primary-secret'));
});

test('primary failure uses secondary and reports safe error code without secrets', async () => {
  const calls = [];
  const { generate, logs } = loadSpeech({ ELEVENLABS_API_KEY: 'first-secret', ELEVENLABS_FALLBACK_API_KEY: 'second-secret' }, async (_url, _body, options) => {
    calls.push(options.headers['xi-api-key']);
    if (calls.length === 1) throw { response: { status: 401, data: Buffer.from(JSON.stringify({ detail: { status: 'quota_exceeded', message: 'first-secret' } })) } };
    return { data: Buffer.alloc(1000) };
  });
  assert.equal((await generate('السلام علیکم')).provider, 'elevenlabs-secondary');
  assert.deepEqual(calls, ['first-secret', 'second-secret']);
  assert(logs.join(' ').includes('quota_exceeded'));
  assert(!logs.join(' ').includes('first-secret'));
});

test('all ElevenLabs keys fail then Google returns audio', async () => {
  let attempts = 0;
  const { generate } = loadSpeech({ ELEVENLABS_API_KEY: 'first', ELEVENLABS_FALLBACK_API_KEY: 'second' }, async () => { attempts++; throw { code: 'ETIMEDOUT' }; });
  assert.equal((await generate('السلام علیکم')).provider, 'google');
  assert.equal(attempts, 2);
});

test('absent or duplicate keys do not trigger extra ElevenLabs attempts', async () => {
  let attempts = 0;
  const post = async () => { attempts++; throw { code: 'ECONNRESET' }; };
  await loadSpeech({}, post).generate('السلام علیکم');
  assert.equal(attempts, 0);
  await loadSpeech({ ELEVENLABS_API_KEY: 'same', ELEVENLABS_FALLBACK_API_KEY: ' same ' }, post).generate('السلام علیکم');
  assert.equal(attempts, 1);
});

test('all providers unavailable returns an explicit unavailable result', async () => {
  const { generate } = loadSpeech({}, async () => { throw Error('unused'); }, async () => { throw Error('offline'); });
  const result = await generate('السلام علیکم');
  assert.equal(result.provider, 'unavailable');
  assert.equal(result.audio.length, 0);
});
