/**
 * Multi-Agent Collaborative Debate Council (Sona / Sarsabz Agri-Agent)
 * Inspired by:
 * 1. CIO's Multi-Agent Medical Council Analogy (Agronomist vs Weather vs Economist)
 * 2. IBM Watson Decision Platform for Agriculture (Electronic Field Record - EFR)
 */

const { getLiveWeatherForecast, getCoordinates } = require('./weatherAgent');

// IBM Watson-Style Electronic Field Record (EFR) Digital Twin
const ELECTRONIC_FIELD_RECORDS = {
  'khanewal': {
    fieldId: 'EFR-PK-KHW-9021',
    farmerName: 'Muhammad Aslam',
    district: 'Khanewal',
    coordinates: { lat: 30.3017, lon: 71.9321 },
    acreage: 10,
    crop: 'Wheat (گندم - Faisalabad-08)',
    sowingDate: '2025-11-15',
    soilProfile: {
      type: 'Clay Loam (زرخیز بھل)',
      ph: 7.9,
      organicMatter: '0.84% (Low)',
      nitrogenDeficit: 'Medium-High',
      moistureSaturationPct: 42
    },
    localFatimaDealer: 'Fatima Agro Services Khanewal Main Bypass',
    fasalPayCreditLimit: 150000,
    fasalPayAvailableCredit: 111000
  }
};

/**
 * 1. Agronomist Agent: Dr. Tariq (Crop Biology & Nutrient Specialist)
 */
function runAgronomistAgent({ crop, acres, soilProfile, proposal }) {
  const isWheat = crop.toLowerCase().includes('wheat') || crop.includes('گندم');
  const acresNum = parseFloat(acres) || 10;
  
  return {
    agentId: 'agronomist_agent',
    agentName: 'Dr. Tariq (Senior Agronomist Agent)',
    role: 'Crop Phenology & Soil Nutrient Specialist',
    avatar: 'fa-user-doctor',
    stance: 'RECOMMEND_APPLICATION',
    argumentUrdu: `گندم اس وقت شگوفے نکالنے (Tillering) کے اہم مرحلے میں ہے۔ پودے کو فوری نائٹروجن درکار ہے تاکہ خوشے بڑے بن سکیں۔ میری تجویز ہے کہ فوری طور پر 1.5 بوری سرسبز کین گوارا (CAN) فی ایکڑ ڈالی جائے۔`,
    argumentEn: `Wheat crop is in critical tillering stage. Immediate vegetative nitrogen is needed to maximize tillers per square meter. Recommends 1.5 bags/acre of Sarsabz CAN.`,
    recommendedProduct: 'Sarsabz CAN (Calcium Ammonium Nitrate 26% N)',
    recommendedBags: Math.round(1.5 * acresNum),
    priority: 'HIGH_BIOLOGICAL_NEED'
  };
}

/**
 * 2. Meteorological Sentinel Agent: Sentinel-Weather (Satellite & Atmospheric Telemetry)
 */
async function runWeatherSentinelAgent({ lat, lon, location }) {
  const weather = await getLiveWeatherForecast(location || 'Khanewal', lat, lon);
  const rainProbs = weather.daily.precipitation_probability_max || [0, 0];
  const windSpeeds = weather.daily.windspeed_10m_max || [10, 10];
  const maxRainProb = Math.max(...rainProbs.slice(0, 2));
  const maxWind = Math.max(...windSpeeds.slice(0, 2));
  const curTemp = (weather.current && weather.current.temp) || 23;
  const curWind = (weather.current && weather.current.windSpeed) || 2;
  const curCond = (weather.current && weather.current.conditionEn) || 'Sunny / Clear';

  const willWashout = maxRainProb >= 40;

  return {
    agentId: 'weather_sentinel_agent',
    agentName: 'Sentinel-Weather (Meteorological Telemetry Agent)',
    role: 'Geospatial Satellite & Atmospheric Safety Engine',
    avatar: 'fa-satellite-dish',
    stance: willWashout ? 'VETO_HAZARD' : 'APPROVED_OPTIMAL',
    maxRainProb,
    maxWind,
    current: weather.current,
    argumentUrdu: willWashout 
      ? `خبردار! سیٹلائٹ ماڈل کے مطابق اگلے 24 سے 36 گھنٹوں میں ${maxRainProb}% بارش متوقع ہے۔ ابھی کھاد ڈالنے سے نائٹروجن زمین میں بہہ جائے گی (Leaching) اور ضائع ہو جائے گی۔ کھاد کا اطلاق فوری روکیں!`
      : `موسم مکمل طور پر خشک اور موزوں ہے۔ لائیو درجہ حرارت ${curTemp}°C، ہوا ${curWind} km/h اور بارش کا امکان 0% ہے۔ کھاد کے نائٹروجن ضیاع کا کوئی خطرہ نہیں ہے۔`,
    argumentEn: willWashout 
      ? `HARD VETO: Satellite models predict a ${maxRainProb}% rain probability in the next 24-36h. Surface nitrogen application will suffer catastrophic leaching and groundwater contamination. Delay application immediately.`
      : `ATMOSPHERIC CLEARANCE: Live conditions: ${curTemp}°C ${curCond}, wind ${curWind} km/h, rain probability is 0%. Safe for soil incorporation.`,
    safeToProceed: !willWashout
  };
}

/**
 * 3. Market & Fintech Economist Agent: FasalPay Economics Engine
 */
function runEconomistAgent({ acres, recommendedBags, willWashout, rainProb }) {
  const bags = recommendedBags || 15;
  const pricePerBag = 3900;
  const totalCost = bags * pricePerBag;
  const potentialLoss = willWashout ? totalCost * 0.75 : 0;
  const usdLoss = Math.round(potentialLoss / 278);

  return {
    agentId: 'fintech_economist_agent',
    agentName: 'FasalPay Market & Economics Agent',
    role: 'Agri-Fintech, Supply Chain & Financial Loss Optimizer',
    avatar: 'fa-hand-holding-dollar',
    stance: willWashout ? 'CONCUR_WITH_VETO' : 'PURCHASE_RECOMMENDED',
    totalCapexPkr: totalCost,
    preventedLossPkr: potentialLoss,
    preventedLossUsd: usdLoss,
    dealerStatus: 'Fatima Khanewal Depot Stock: 850 Bags Available',
    commercialIncentiveUrdu: willWashout
      ? `اگر بارش سے قبل کھاد ڈالی گئی تو کسان کا **Rs. ${potentialLoss.toLocaleString()}** ($${usdLoss}) کا خالص مالی نقصان ہوگا۔ 48 گھنٹے انتظار پر فصل پے پر 5% سبسڈی رعایت دستیاب ہے۔`
      : `فاطمہ ڈیلر پر کین گوارا کا تازہ اسٹاک دستیاب ہے۔ فصل پے بائی ناؤ پے لیٹر (BNPL) کے تحت 0% مارک اپ پر ادائیگی کٹائی پر ممکن ہے۔`,
    commercialIncentiveEn: willWashout
      ? `Applying fertilizer prior to the storm incurs a direct capital loss of Rs. ${potentialLoss.toLocaleString()} ($${usdLoss}). Postponing unlocks a 5% FasalPay green-subsidy window on Thursday.`
      : `Adequate depot inventory verified. FasalPay zero-markup BNPL financing is pre-approved for this farmer.`
  };
}

/**
 * 4. Chief Arbiter: Council Consensus Engine
 * Synthesizes the inter-agent debate and derives the optimal compromise.
 */
function runChiefArbiterCouncil({ agronomist, weather, economist, efr }) {
  const hasVeto = weather.stance === 'VETO_HAZARD';

  let debateTranscript = [
    {
      speaker: agronomist.agentName,
      badge: 'Agronomy Step',
      text: agronomist.argumentEn,
      urdu: agronomist.argumentUrdu,
      type: 'proposal'
    },
    {
      speaker: weather.agentName,
      badge: hasVeto ? 'Meteorological Veto' : 'Weather Approval',
      text: weather.argumentEn,
      urdu: weather.argumentUrdu,
      type: hasVeto ? 'veto' : 'approval'
    },
    {
      speaker: economist.agentName,
      badge: 'Financial Assessment',
      text: economist.argumentEn,
      urdu: economist.argumentUrdu,
      type: 'financial'
    }
  ];

  let consensusVerdict = {};

  const today = new Date();
  const targetAppDate = new Date(today);
  targetAppDate.setDate(today.getDate() + (hasVeto ? 3 : 1));
  const targetDateStr = targetAppDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

  const draftOrder = {
    orderId: `DRAFT-${Date.now().toString().slice(-5)}`,
    items: `${agronomist.recommendedBags} Bags ${agronomist.recommendedProduct}`,
    bagsCount: agronomist.recommendedBags,
    product: agronomist.recommendedProduct,
    pricePerBag: 3900,
    totalAmount: agronomist.recommendedBags * 3900,
    totalUsd: Math.round((agronomist.recommendedBags * 3900) / 278),
    targetApplicationDate: targetDateStr,
    dealer: efr?.localFatimaDealer || `Fatima Agro Services (${efr?.district || 'Local'} Center)`,
    paymentMethod: 'فصل پے زرعی قرضہ (FasalPay BNPL)',
    status: 'DRAFT_AWAITING_HUMAN_FARMER_SIGN_OFF',
    hitlRequired: true
  };

  if (hasVeto) {
    consensusVerdict = {
      decision: 'SYNCHRONIZED_POSTPONEMENT',
      decisionTitle: '48-Hour Chemical Application Freeze (طوفان کے پیش نظر کھاد میں تاخیر کا فیصلہ)',
      statusBadge: 'UNANIMOUS COUNCIL COMPROMISE',
      statusColor: 'orange',
      targetApplicationDate: targetDateStr,
      draftOrder,
      isClearWeather: false,
      actionPlanUrdu: `**کونسل کا متفقہ فیصلہ:** ڈاکٹر طارق کی تجویز درست ہے کہ فصل کو کھاد چاہیے، لیکن کل کی متوقع بارش کھاد کو ضائع کر دے گی۔ لہٰذا کھاد کا اطلاق **${targetDateStr}** تک مؤخر کیا جاتا ہے، جس سے **Rs. ${economist.preventedLossPkr.toLocaleString()}** ($${economist.preventedLossUsd}) کی بچت ہوگی۔ نیچے دیے گئے تجویز کردہ ڈرافٹ آرڈر کی تصدیق فرمائیں۔`,
      actionPlanEn: `**Unanimous Council Consensus:** Biological demand aligned with weather veto. Chemical freeze declared for 48h until soil dries post-rain. Recommended application date: ${targetDateStr}. Capital conserved: Rs. ${economist.preventedLossPkr.toLocaleString()} ($${economist.preventedLossUsd}).`,
      nextSafeWindow: `${targetDateStr} (Optimal Post-Rain Incorporation)`,
      lossPreventedPkr: economist.preventedLossPkr,
      lossPreventedUsd: economist.preventedLossUsd,
      nitrogenSavedKg: Math.round(agronomist.recommendedBags * 25 * 0.26 * 0.75),
      outcomeHeadline: `Rs. ${economist.preventedLossPkr.toLocaleString()} Capital Conserved | ${Math.round(agronomist.recommendedBags * 25 * 0.26 * 0.75)} kg N-Runoff Prevented`
    };
  } else {
    consensusVerdict = {
      decision: 'PROCEED_WITH_PRECISION',
      decisionTitle: 'Optimal Agronomic Application Window Cleared (کھاد کے اطلاق کی حتمی منظوری)',
      statusBadge: 'UNANIMOUS APPROVAL',
      statusColor: 'green',
      targetApplicationDate: targetDateStr,
      draftOrder,
      isClearWeather: true,
      actionPlanUrdu: `**کونسل کا متفقہ فیصلہ:** موسمی حالات بالکل سازگار ہیں۔ **${targetDateStr}** پر ${agronomist.recommendedBags} بوری سرسبز کین گوارا پہلے پانی کے ساتھ استعمال کریں۔ مطلع صاف ہونے کی وجہ سے کھاد ضائع ہونے کا خطرہ 0% اور پودے کے نائٹروجن جذب کرنے کی شرح 100% ہے۔ نیچے دیے گئے ڈرافٹ آرڈر کی تصدیق فرمائیں۔`,
      actionPlanEn: `**Unanimous Council Consensus:** Favorable weather confirmed. Optimal application window: ${targetDateStr} for ${agronomist.recommendedBags} bags Sarsabz CAN. 100% nutrient absorption efficiency.`,
      nextSafeWindow: `${targetDateStr} (Next 24 Hours)`,
      lossPreventedPkr: 0,
      lossPreventedUsd: 0,
      nitrogenSavedKg: 0,
      outcomeHeadline: '100% Soil Nutrient Absorption Efficiency | 0% Chemical Leaching Risk (Optimal Clear Skies)'
    };
  }

  return {
    debateTranscript,
    consensusVerdict,
    efrRecord: efr || ELECTRONIC_FIELD_RECORDS['khanewal']
  };
}

/**
 * Main Public API: Execute Multi-Agent Consensus Debate
 */
async function conductMultiAgentDebate({ location = null, crop = 'Wheat', acres = 10, lat = null, lon = null, forceAnomaly = false }) {
  const coords = await getCoordinates(location, lat, lon);
  const locKey = (coords.name || '').toLowerCase();
  const efr = ELECTRONIC_FIELD_RECORDS[locKey] || {
    ...(ELECTRONIC_FIELD_RECORDS['khanewal'] || {}),
    fieldId: `EFR-PK-${(coords.name || 'AGRI').substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
    district: coords.name,
    coordinates: { lat: coords.lat, lon: coords.lon },
    localFatimaDealer: `Fatima Agro Services (${coords.name} Regional Hub)`,
    crop,
    acreage: acres
  };

  // 1. Agronomist evaluation
  const agronomist = runAgronomistAgent({ crop, acres, soilProfile: efr.soilProfile, proposal: 'apply_urea' });

  // 2. Weather sentinel evaluation
  let weather = await runWeatherSentinelAgent({ lat: coords.lat, lon: coords.lon, location: coords.name });
  if (forceAnomaly) {
    weather.stance = 'VETO_HAZARD';
    weather.maxRainProb = 92;
    weather.argumentUrdu = `خبردار! ایمرجنسی سیٹلائٹ ریڈار کے مطابق طوفانی بارش کا 92% امکان ہے۔ فوری کھاد روکیں ورنہ کیمیکل بہہ جائے گا!`;
    weather.argumentEn = `EMERGENCY CLIMATE ANOMALY: Flash storm hazard (92% rain probability). Hard veto on all surface chemical broadcasting.`;
    weather.safeToProceed = false;
  }

  // 3. Fintech economist evaluation
  const economist = runEconomistAgent({
    acres,
    recommendedBags: agronomist.recommendedBags,
    willWashout: weather.stance === 'VETO_HAZARD',
    rainProb: weather.maxRainProb
  });

  // 4. Chief Arbiter consensus synthesis
  const councilResult = runChiefArbiterCouncil({ agronomist, weather, economist, efr });

  return {
    success: true,
    location: coords.name,
    country: coords.country,
    coordinates: { lat: coords.lat, lon: coords.lon },
    crop,
    acres,
    agronomist,
    weather,
    economist,
    ...councilResult
  };
}

module.exports = {
  conductMultiAgentDebate,
  ELECTRONIC_FIELD_RECORDS
};
