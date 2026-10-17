const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Ensure local data backup directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const localOrdersPath = path.join(dataDir, 'orders.json');
const localLogsPath = path.join(dataDir, 'question_logs.json');

if (!fs.existsSync(localOrdersPath)) fs.writeFileSync(localOrdersPath, '[]', 'utf8');
if (!fs.existsSync(localLogsPath)) fs.writeFileSync(localLogsPath, '[]', 'utf8');

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

let supabase = null;
if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
    console.log('⚡ Supabase Cloud Client Initialized successfully for FasalPay / Sarsabz!');
  } catch (err) {
    console.warn('⚠️ Supabase init warning, running in local resilient mode:', err.message);
  }
}

// Helper: Save Order (Dual Write: Supabase Cloud + Local Backup)
async function createOrder(orderData) {
  const orderRecord = {
    order_id: orderData.orderId || `FP-${Date.now().toString().slice(-5)}`,
    farmer_name: orderData.farmerName || 'کسان بھائی',
    phone: orderData.phone || '0300-XXXXXXX',
    district: orderData.district || 'پنجاب',
    crop: orderData.crop || 'گندم (Wheat)',
    items: typeof orderData.items === 'object' ? JSON.stringify(orderData.items) : orderData.items,
    total_amount: Number(orderData.totalAmount) || 0,
    payment_method: orderData.paymentMethod || 'فصل پے زرعی قرضہ (FasalPay Financing)',
    status: orderData.status || 'منظور شدہ (Credit Pre-Approved)',
    dealer: orderData.dealer || 'قریبی سرسبز ڈیلر نیٹ ورک (Fatima Dealer)',
    created_at: new Date().toISOString()
  };

  // 1. Write to local backup
  try {
    const localData = JSON.parse(fs.readFileSync(localOrdersPath, 'utf8') || '[]');
    localData.unshift(orderRecord);
    fs.writeFileSync(localOrdersPath, JSON.stringify(localData, null, 2), 'utf8');
  } catch (localErr) {
    console.error('Local order write error:', localErr.message);
  }

  // 2. Write to Supabase Cloud
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([orderRecord])
        .select();

      if (error) {
        console.warn('Supabase order insert notice (using local mirror):', error.message);
      } else {
        console.log(`✅ Order ${orderRecord.order_id} successfully persisted in Supabase Cloud!`);
      }
    } catch (cloudErr) {
      console.warn('Supabase Cloud Sync Notice:', cloudErr.message);
    }
  }

  return orderRecord;
}

// Helper: Get All Orders
async function getAllOrders() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch (e) {
      console.warn('Supabase fetch notice, falling back to local store:', e.message);
    }
  }

  try {
    return JSON.parse(fs.readFileSync(localOrdersPath, 'utf8') || '[]');
  } catch (e) {
    return [];
  }
}

// Helper: Log Question & Answers
async function logQuestion(logData) {
  const logRecord = {
    question: logData.question || '',
    answer: logData.answer || '',
    input_type: logData.inputType || 'voice',
    created_at: new Date().toISOString()
  };

  try {
    const localLogs = JSON.parse(fs.readFileSync(localLogsPath, 'utf8') || '[]');
    localLogs.unshift(logRecord);
    fs.writeFileSync(localLogsPath, JSON.stringify(localLogs.slice(0, 200), null, 2), 'utf8');
  } catch (e) {}

  if (supabase) {
    try {
      await supabase.from('question_logs').insert([logRecord]);
    } catch (e) {}
  }
}

// Helper: Update Order Status (Human-in-the-Loop Dealer Verification)
async function updateOrderStatus(orderId, newStatus, humanOperator = 'Fatima Dealer Officer (Khanewal)') {
  const verifiedAt = new Date().toISOString();

  // 1. Update local store
  try {
    const localData = JSON.parse(fs.readFileSync(localOrdersPath, 'utf8') || '[]');
    const idx = localData.findIndex(o => o.order_id === orderId);
    if (idx !== -1) {
      localData[idx].status = newStatus;
      localData[idx].human_verified_by = humanOperator;
      localData[idx].human_verified_at = verifiedAt;
      fs.writeFileSync(localOrdersPath, JSON.stringify(localData, null, 2), 'utf8');
    }
  } catch (e) {
    console.error('Local order update error:', e.message);
  }

  // 2. Update Supabase Cloud
  if (supabase) {
    try {
      await supabase.from('orders').update({
        status: newStatus,
        human_verified_by: humanOperator,
        human_verified_at: verifiedAt
      }).eq('order_id', orderId);
    } catch (e) {}
  }

  return { success: true, orderId, status: newStatus, humanOperator, verifiedAt };
}

// Helper: Log Human Operator Overrides (HITL Governance Audit Trail)
const localOverridePath = path.join(dataDir, 'human_overrides.json');
if (!fs.existsSync(localOverridePath)) fs.writeFileSync(localOverridePath, '[]', 'utf8');

async function logHumanOverride(overrideData) {
  const overrideRecord = {
    id: `OVR-${Date.now().toString().slice(-5)}`,
    farmer_name: overrideData.farmerName || 'Muhammad Aslam',
    district: overrideData.district || 'Khanewal',
    crop: overrideData.crop || 'Wheat (گندم)',
    action_taken: overrideData.actionTaken || 'Operator Manual Override',
    ai_warning: overrideData.aiWarning || 'Council recommended 48h freeze due to flash rain hazard',
    override_reason: overrideData.overrideReason || 'Operator chose to proceed despite risk',
    status: 'MANUAL_HUMAN_OVERRIDE_RECORDED',
    timestamp: new Date().toISOString()
  };

  try {
    const overrides = JSON.parse(fs.readFileSync(localOverridePath, 'utf8') || '[]');
    overrides.unshift(overrideRecord);
    fs.writeFileSync(localOverridePath, JSON.stringify(overrides.slice(0, 100), null, 2), 'utf8');
  } catch (e) {}

  if (supabase) {
    try {
      await supabase.from('human_overrides').insert([overrideRecord]);
    } catch (e) {}
  }

  return overrideRecord;
}

// Helper: Farmer Profile (Digital Twin Registration & Profile Persistence)
const localProfilesPath = path.join(dataDir, 'farmer_profiles.json');
if (!fs.existsSync(localProfilesPath)) fs.writeFileSync(localProfilesPath, '[]', 'utf8');

async function saveFarmerProfile(profileData) {
  const profileRecord = {
    farmer_id: profileData.farmerId || `FARMER-${Date.now().toString().slice(-5)}`,
    name: profileData.name || 'محمد اسلم (Muhammad Aslam)',
    phone: profileData.phone || '0300-XXXXXXX',
    district: profileData.district || 'Islamabad',
    lat: profileData.lat !== undefined && profileData.lat !== null ? parseFloat(profileData.lat) : null,
    lon: profileData.lon !== undefined && profileData.lon !== null ? parseFloat(profileData.lon) : null,
    acres: parseFloat(profileData.acres) || 10,
    crops: profileData.crops || 'گندم (Wheat)',
    crop_stage: profileData.cropStage || 'شگوفے / پہلا پانی (Tillering)',
    challenges: profileData.challenges || 'پتوں کا پیلا پن اور کھاد کی رہنمائی (Leaf Yellowing / Nitrogen Deficit)',
    soil_type: profileData.soilType || 'Clay Loam (زرخیز بھل)',
    updated_at: new Date().toISOString()
  };

  // 1. Local Persistence
  try {
    const profiles = JSON.parse(fs.readFileSync(localProfilesPath, 'utf8') || '[]');
    const existingIdx = profiles.findIndex(p => p.farmer_id === profileRecord.farmer_id || p.phone === profileRecord.phone);
    if (existingIdx !== -1) {
      profiles[existingIdx] = profileRecord;
    } else {
      profiles.unshift(profileRecord);
    }
    fs.writeFileSync(localProfilesPath, JSON.stringify(profiles, null, 2), 'utf8');
  } catch (err) {
    console.error('Local profile write error:', err.message);
  }

  // 2. Supabase Cloud Persistence
  if (supabase) {
    try {
      await supabase.from('farmer_profiles').upsert([profileRecord]);
    } catch (e) {}
  }

  return profileRecord;
}

async function getFarmerProfile(farmerId = null) {
  try {
    const profiles = JSON.parse(fs.readFileSync(localProfilesPath, 'utf8') || '[]');
    if (farmerId) {
      return profiles.find(p => p.farmer_id === farmerId) || profiles[0] || null;
    }
    return profiles[0] || null;
  } catch (err) {
    return null;
  }
}

// Helper: Clear All Orders (From Supabase Cloud & Local Storage)
async function clearAllOrders() {
  // 1. Wipe local store
  try {
    fs.writeFileSync(localOrdersPath, '[]', 'utf8');
  } catch (e) {}

  // 2. Wipe Supabase Cloud if connected
  if (supabase) {
    try {
      await supabase.from('orders').delete().neq('id', 0);
    } catch (e) {}
  }

  return true;
}

// Helper: Clear Farmer Profiles (From Supabase Cloud & Local Storage)
async function clearFarmerProfiles() {
  try {
    fs.writeFileSync(localProfilesPath, '[]', 'utf8');
  } catch (e) {}

  if (supabase) {
    try {
      await supabase.from('farmer_profiles').delete().neq('farmer_id', '___NEVER_MATCH___');
    } catch (e) {}
  }

  return true;
}

module.exports = {
  createOrder,
  getAllOrders,
  updateOrderStatus,
  logHumanOverride,
  saveFarmerProfile,
  getFarmerProfile,
  clearFarmerProfiles,
  clearAllOrders,
  logQuestion,
  supabase
};
