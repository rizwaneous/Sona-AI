/**
 * Enterprise-Grade Pakistani Spoken Mobile Number Parser & Formatter
 * Supports:
 * - STT transcribed chunks with filler words: "0308 48 15 900 پورا"
 * - Spoken Roman Urdu / Punjabi: "zero teeno so ath, artali pandra no so"
 * - Spoken Urdu Script: "صفر تین سو آٹھ اڑتالیس پندرہ نو سو پورا"
 * - English words: "zero three zero eight four eight one five nine zero zero"
 * - Country code prefixes: "+92 308 4815900", "923084815900", "00923084815900"
 * - Returns clean formatted string: "0308-4815900"
 */

function formatPakistaniPhoneNumber(digits) {
  if (!digits) return '';
  const d = String(digits).replace(/\D/g, '');
  if (d.length === 11 && d.startsWith('03')) {
    return `${d.substring(0, 4)}-${d.substring(4)}`;
  }
  return digits;
}

function parseSpokenUrduPhoneNumber(text) {
  if (!text) return '';

  let raw = String(text).trim();

  // Remove common filler words from STT like "پورا", "نمبر", "میرا نمبر", "فون", "ہے", "نوٹ کرو"
  raw = raw
    .replace(/(پورا|پورہ|نمبر ہے|میرا نمبر|فون نمبر|موبائل|درج کرو|لکھو|my number is|number is|phone)/gi, ' ')
    .trim();

  // 1. Direct Regex for digits (Handles +92, 0092, 92, 03xx with spaces/dashes)
  // Example: "+92 308 4815900" or "0308 48 15 900"
  let cleanDigitsOnly = raw.replace(/\D/g, '');
  if (cleanDigitsOnly.startsWith('923') && cleanDigitsOnly.length === 12) {
    cleanDigitsOnly = '0' + cleanDigitsOnly.substring(2);
  } else if (cleanDigitsOnly.startsWith('00923') && cleanDigitsOnly.length === 14) {
    cleanDigitsOnly = '0' + cleanDigitsOnly.substring(4);
  } else if (cleanDigitsOnly.startsWith('3') && cleanDigitsOnly.length === 10) {
    cleanDigitsOnly = '0' + cleanDigitsOnly;
  }

  if (cleanDigitsOnly.length === 11 && cleanDigitsOnly.startsWith('03')) {
    return formatPakistaniPhoneNumber(cleanDigitsOnly);
  }

  // 2. Tokenize and normalize spoken words
  let s = ' ' + raw.toLowerCase()
    .replace(/[\,\-\_\.\:\;\/\(\)\+]/g, ' ')
    .replace(/\s+/g, ' ') + ' ';

  // Normalize English Spoken Digits
  const englishDigits = [
    { re: /\bzero\b|\bo\b|\boh\b/gi, val: '0' },
    { re: /\bone\b/gi, val: '1' },
    { re: /\btwo\b/gi, val: '2' },
    { re: /\bthree\b/gi, val: '3' },
    { re: /\bfour\b/gi, val: '4' },
    { re: /\bfive\b/gi, val: '5' },
    { re: /\bsix\b/gi, val: '6' },
    { re: /\bseven\b/gi, val: '7' },
    { re: /\beight\b/gi, val: '8' },
    { re: /\bnine\b/gi, val: '9' }
  ];
  for (const item of englishDigits) {
    s = s.replace(item.re, ` ${item.val} `);
  }

  // 3. High-Priority Pakistani Mobile Network Prefixes (0300 to 0349)
  const prefixMap = [
    { pattern: /(?:^|\s)(?:zero|sifar|sefar|0|صفر|زیرو)?\s*(?:teen|teeno|tin|تین|3)\s*(?:sau|so|soo|سو)\s*(?:aath|ath|آٹھ|8)/gi, val: ' 0308 ' },
    { pattern: /(?:^|\s)(?:zero|sifar|sefar|0|صفر|زیرو)?\s*(?:teen|teeno|tin|تین|3)\s*(?:sau|so|soo|سو)\s*(?:saat|sat|سات|7)/gi, val: ' 0307 ' },
    { pattern: /(?:^|\s)(?:zero|sifar|sefar|0|صفر|زیرو)?\s*(?:teen|teeno|tin|تین|3)\s*(?:sau|so|soo|سو)\s*(?:che|chay|چھ|6)/gi, val: ' 0306 ' },
    { pattern: /(?:^|\s)(?:zero|sifar|sefar|0|صفر|زیرو)?\s*(?:teen|teeno|tin|تین|3)\s*(?:sau|so|soo|سو)\s*(?:panch|paanch|پانچ|5)/gi, val: ' 0305 ' },
    { pattern: /(?:^|\s)(?:zero|sifar|sefar|0|صفر|زیرو)?\s*(?:teen|teeno|tin|تین|3)\s*(?:sau|so|soo|سو)\s*(?:char|chaar|چار|4)/gi, val: ' 0304 ' },
    { pattern: /(?:^|\s)(?:zero|sifar|sefar|0|صفر|زیرو)?\s*(?:teen|teeno|tin|تین|3)\s*(?:sau|so|soo|سو)\s*(?:teen|tin|تین|3)/gi, val: ' 0303 ' },
    { pattern: /(?:^|\s)(?:zero|sifar|sefar|0|صفر|زیرو)?\s*(?:teen|teeno|tin|تین|3)\s*(?:sau|so|soo|سو)\s*(?:do|دو|2)/gi, val: ' 0302 ' },
    { pattern: /(?:^|\s)(?:zero|sifar|sefar|0|صفر|زیرو)?\s*(?:teen|teeno|tin|تین|3)\s*(?:sau|so|soo|سو)\s*(?:aik|ek|ik|ایک|1)/gi, val: ' 0301 ' },
    { pattern: /(?:^|\s)(?:zero|sifar|sefar|0|صفر|زیرو)?\s*(?:teen|teeno|tin|تین|3)\s*(?:sau|so|soo|سو)\s*(?:nau|no|نو|9)/gi, val: ' 0309 ' },
    { pattern: /(?:^|\s)(?:zero|sifar|sefar|0|صفر|زیرو)?\s*(?:teen|teeno|tin|تین|3)\s*(?:sau|so|soo|سو)/gi, val: ' 0300 ' }
  ];

  for (const item of prefixMap) {
    s = s.replace(item.pattern, item.val);
  }

  // 4. Hundreds Multiples (900, 800, 700... down to 100)
  s = s
    .replace(/(?:nau|no|نو|9)\s*(?:sau|so|soo|سو)/gi, ' 900 ')
    .replace(/(?:aath|ath|آٹھ|8)\s*(?:sau|so|soo|سو)/gi, ' 800 ')
    .replace(/(?:saat|sat|سات|7)\s*(?:sau|so|soo|سو)/gi, ' 700 ')
    .replace(/(?:che|chay|چھ|6)\s*(?:sau|so|soo|سو)/gi, ' 600 ')
    .replace(/(?:panch|paanch|پانچ|5)\s*(?:sau|so|soo|سو)/gi, ' 500 ')
    .replace(/(?:char|chaar|چار|4)\s*(?:sau|so|soo|سو)/gi, ' 400 ')
    .replace(/(?:teen|tin|تین|3)\s*(?:sau|so|soo|سو)/gi, ' 300 ')
    .replace(/(?:do|دو|2)\s*(?:sau|so|soo|سو)/gi, ' 200 ')
    .replace(/(?:aik|ek|ایک|1)\s*(?:sau|so|soo|سو)/gi, ' 100 ');

  // 5. Complete Number Mapping (99 down to 0)
  const numberTokens = [
    // 90-99
    { words: ['ninyanwe', 'ninaanwe', 'ننانوے'], val: '99' },
    { words: ['athanwe', 'athaanwe', 'اٹھانوے'], val: '98' },
    { words: ['satanwe', 'sataanwe', 'ستانوے'], val: '97' },
    { words: ['chhiyanwe', 'chheeyanwe', 'چھیانوے'], val: '96' },
    { words: ['pachanwe', 'pachaanwe', 'پچانوے'], val: '95' },
    { words: ['chauranwe', 'choraanwe', 'چورانوے'], val: '94' },
    { words: ['tiranwe', 'tiraanwe', 'ترانوے'], val: '93' },
    { words: ['banwe', 'baanwe', 'بانوے'], val: '92' },
    { words: ['ikyanwe', 'ikyaanwe', 'اکیانوے'], val: '91' },
    { words: ['nabbe', 'nabbey', 'نولے', 'نوے'], val: '90' },

    // 80-89
    { words: ['nawasi', 'unasi', 'نواسی'], val: '89' },
    { words: ['athasi', 'athaasi', 'اٹھاسی'], val: '88' },
    { words: ['satasi', 'sataasi', 'ستاسی'], val: '87' },
    { words: ['chhiyasi', 'chhiyaasi', 'چھیاسی'], val: '86' },
    { words: ['pachasi', 'pachaasi', 'پچاسی'], val: '85' },
    { words: ['chaurasi', 'choraasi', 'چوراسی'], val: '84' },
    { words: ['tirasi', 'tiraasi', 'تراسی'], val: '83' },
    { words: ['byasi', 'bayaasi', 'بیاسی', 'baasi'], val: '82' },
    { words: ['ikyasi', 'ikyaasi', 'اکیاسی'], val: '81' },
    { words: ['assi', 'assee', 'اسی'], val: '80' },

    // 70-79
    { words: ['unasi', 'unaasi', 'اناسی'], val: '79' },
    { words: ['athhattar', 'athattar', 'اٹھہتر'], val: '78' },
    { words: ['satattar', 'sathattar', 'ستتر'], val: '77' },
    { words: ['chhihattar', 'chhattar', 'چھہتر'], val: '76' },
    { words: ['pachhattar', 'pachattar', 'پچھتر'], val: '75' },
    { words: ['chauhattar', 'chawhattar', 'چوہتر'], val: '74' },
    { words: ['tihattar', 'tehattar', 'تہتر'], val: '73' },
    { words: ['bahattar', 'behattar', 'بہتر'], val: '72' },
    { words: ['ikhattar', 'khattar', 'اکہتر'], val: '71' },
    { words: ['sattar', 'sat-tar', 'ستر'], val: '70' },

    // 60-69
    { words: ['unhattar', 'unhat-tar', 'انہتر'], val: '69' },
    { words: ['athsath', 'اٹھسٹھ'], val: '68' },
    { words: ['sarsath', 'سڑسٹھ'], val: '67' },
    { words: ['chhiyasaath', 'chiyasath', 'چھیاسٹھ'], val: '66' },
    { words: ['pensath', 'painsath', 'پینسٹھ'], val: '65' },
    { words: ['chaunsath', 'chonsath', 'چونسٹھ'], val: '64' },
    { words: ['tirsath', 'tresath', 'ترسٹھ'], val: '63' },
    { words: ['basath', 'baasath', 'باسٹھ'], val: '62' },
    { words: ['iksath', 'ikisath', 'اکسٹھ'], val: '61' },
    { words: ['saath', 'sath', 'ساٹھ'], val: '60' },

    // 50-59
    { words: ['unsath', 'unsuth', 'انسٹھ'], val: '59' },
    { words: ['atthawan', 'athawan', 'اٹھاون'], val: '58' },
    { words: ['sattawan', 'satawan', 'satwanja', 'ستاون'], val: '57' },
    { words: ['chhappan', 'chappan', 'چھپن'], val: '56' },
    { words: ['pachpan', 'pachwun', 'پچپن'], val: '55' },
    { words: ['chawwan', 'chowan', 'چون'], val: '54' },
    { words: ['tirpan', 'tripan', 'ترپن'], val: '53' },
    { words: ['bawan', 'baawan', 'bawinja', 'بیاون'], val: '52' },
    { words: ['ikyawan', 'ikawan', 'اکیاون'], val: '51' },
    { words: ['pachaas', 'pachas', 'پچاس'], val: '50' },

    // 40-49
    { words: ['unchaas', 'unchas', 'انچاس'], val: '49' },
    { words: ['artalees', 'artalis', 'artali', 'اڑتالیس', 'اٹھتالیس', 'artalees'], val: '48' },
    { words: ['sentalees', 'santalis', 'سینتالیس'], val: '47' },
    { words: ['chhiyalees', 'chhayalis', 'چھیاستھ'], val: '46' },
    { words: ['pentalees', 'paintalis', 'پینتالیس'], val: '45' },
    { words: ['chawalees', 'chawalis', 'چوالیس'], val: '44' },
    { words: ['tentalees', 'tentalis', 'تینتالیس'], val: '43' },
    { words: ['byalees', 'bayalis', 'بیالیس'], val: '42' },
    { words: ['iktalees', 'iktalis', 'اکتالیس'], val: '41' },
    { words: ['chalees', 'chalis', 'چالیس'], val: '40' },

    // 30-39
    { words: ['untalees', 'untalis', 'انتالیس'], val: '39' },
    { words: ['athtees', 'athtis', 'اڑتیس'], val: '38' },
    { words: ['sentees', 'santis', 'سینتیس'], val: '37' },
    { words: ['chhattees', 'chatis', 'چھتیس'], val: '36' },
    { words: ['pentees', 'paintis', 'پینتیس'], val: '35' },
    { words: ['chauntees', 'chontis', 'چونتیس'], val: '34' },
    { words: ['tentees', 'tentis', 'تینتیس'], val: '33' },
    { words: ['battees', 'battis', 'بتیس'], val: '32' },
    { words: ['ikattees', 'ikatis', 'اکتیس'], val: '31' },
    { words: ['tees', 'tis', 'تیس'], val: '30' },

    // 20-29
    { words: ['untees', 'unattis', 'انتیس'], val: '29' },
    { words: ['atthaees', 'athais', 'اٹھائیس'], val: '28' },
    { words: ['sattaees', 'satais', 'ستائیس'], val: '27' },
    { words: ['chhabees', 'chabis', 'چھبیس'], val: '26' },
    { words: ['pachees', 'pachis', 'پچیس'], val: '25' },
    { words: ['chobees', 'chobis', 'چوبیس'], val: '24' },
    { words: ['teis', 'teees', 'تئیس'], val: '23' },
    { words: ['baees', 'baies', 'بائیس'], val: '22' },
    { words: ['ikkees', 'ikkis', 'اکیس'], val: '21' },
    { words: ['bees', 'bis', 'بیس'], val: '20' },

    // 10-19
    { words: ['unnees', 'unis', 'انیس'], val: '19' },
    { words: ['athara', 'atharah', 'اٹھارہ'], val: '18' },
    { words: ['satra', 'satrah', 'سترہ'], val: '17' },
    { words: ['sola', 'solah', 'سولہ'], val: '16' },
    { words: ['pandra', 'pandrah', 'پندرہ'], val: '15' },
    { words: ['chauda', 'chaudah', 'چودہ'], val: '14' },
    { words: ['tera', 'terah', 'تیرہ'], val: '13' },
    { words: ['bara', 'barah', 'بارہ'], val: '12' },
    { words: ['gyara', 'gyarah', 'گیارہ'], val: '11' },
    { words: ['das', 'duss', 'دس'], val: '10' },

    // Single digits (0-9)
    { words: ['nau', 'no', 'نو'], val: '9' },
    { words: ['aath', 'ath', 'آٹھ'], val: '8' },
    { words: ['saat', 'sat', 'سات'], val: '7' },
    { words: ['che', 'chay', 'chheh', 'چھ'], val: '6' },
    { words: ['panch', 'paanch', 'پانچ'], val: '5' },
    { words: ['char', 'chaar', 'چار'], val: '4' },
    { words: ['teen', 'tin', 'تین'], val: '3' },
    { words: ['do', 'doo', 'دو'], val: '2' },
    { words: ['aik', 'ek', 'ik', 'ایک'], val: '1' },
    { words: ['sifar', 'sifir', 'sefar', 'zeero', 'zero', 'صفر', 'زیرو'], val: '0' }
  ];

  for (const token of numberTokens) {
    for (const w of token.words) {
      const escaped = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`(^|\\s|[^a-zA-Z0-9\\u0600-\\u06FF])${escaped}($|\\s|[^a-zA-Z0-9\\u0600-\\u06FF])`, 'gi');
      s = s.replace(re, `$1 ${token.val} $2`);
    }
  }

  // 6. Extract all digits and clean
  let finalDigits = s.replace(/\D/g, '');

  if (finalDigits.startsWith('923') && finalDigits.length === 12) {
    finalDigits = '0' + finalDigits.substring(2);
  } else if (finalDigits.startsWith('00923') && finalDigits.length === 14) {
    finalDigits = '0' + finalDigits.substring(4);
  } else if (finalDigits.startsWith('3') && finalDigits.length === 10) {
    finalDigits = '0' + finalDigits;
  }

  if (finalDigits.length >= 11 && finalDigits.startsWith('03')) {
    return formatPakistaniPhoneNumber(finalDigits.substring(0, 11));
  }

  if (finalDigits.length === 11) {
    return formatPakistaniPhoneNumber(finalDigits);
  }

  return raw;
}

module.exports = {
  parseSpokenUrduPhoneNumber,
  formatPakistaniPhoneNumber
};
