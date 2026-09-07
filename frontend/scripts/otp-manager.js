const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const STORE_PATH = path.join(__dirname, '..', 'data', 'otp-store.json');

function generateSecureRandomPassword(length = 16) {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const special = '!@#$%^&*-_=+';
  const all = upper + lower + digits + special;

  const pwd = [
    upper[crypto.randomInt(upper.length)],
    upper[crypto.randomInt(upper.length)],
    lower[crypto.randomInt(lower.length)],
    lower[crypto.randomInt(lower.length)],
    digits[crypto.randomInt(digits.length)],
    digits[crypto.randomInt(digits.length)],
    special[crypto.randomInt(special.length)],
    special[crypto.randomInt(special.length)],
  ];

  while (pwd.length < length) {
    pwd.push(all[crypto.randomInt(all.length)]);
  }

  for (let i = pwd.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [pwd[i], pwd[j]] = [pwd[j], pwd[i]];
  }

  return pwd.join('');
}

function listOtps() {
  if (!fs.existsSync(STORE_PATH)) {
    console.log('No OTP store file found at', STORE_PATH);
    return;
  }
  const data = JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
  console.log('\n=== CEC SCHOOL PORTAL — ONE-TIME PASSWORDS STATUS ===');
  console.table(
    data.map((r) => ({
      ID: r.id,
      Label: r.label,
      Status: r.status,
      UsedAt: r.usedAt || '-',
      UsedBy: r.usedBy || '-',
    }))
  );
}

function resetOtps() {
  const newBatch = [];
  for (let i = 1; i <= 10; i++) {
    newBatch.push({
      id: i,
      label: `OTP-${String(i).padStart(2, '0')}`,
      password: generateSecureRandomPassword(16),
    });
  }

  const hashedRecords = newBatch.map((item) => {
    const salt = `cec_otp_salt_${item.id}_${crypto.randomBytes(8).toString('hex')}`;
    const passwordHash = crypto
      .createHash('sha256')
      .update(`${salt}:${item.password}`)
      .digest('hex');

    return {
      id: item.id,
      label: item.label,
      passwordHash,
      salt,
      status: 'AVAILABLE',
      usedAt: null,
      usedBy: null,
      usedIp: null,
      createdAt: new Date().toISOString(),
    };
  });

  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(hashedRecords, null, 2), 'utf8');

  console.log('\n=== NEW 10 ONE-TIME DEMO PASSWORDS GENERATED ===\n');
  console.log('SAVE THESE PASSWORDS SECURELY FOR TESTING:\n');
  console.table(newBatch);
}

const command = process.argv[2] || 'list';
if (command === 'reset' || command === 'generate') {
  resetOtps();
} else {
  listOtps();
}
