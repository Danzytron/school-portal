import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface OtpRecord {
  id: number;
  label: string;
  passwordHash: string;
  salt: string;
  status: 'AVAILABLE' | 'USED';
  usedAt: string | null;
  usedBy: string | null;
  usedIp: string | null;
  createdAt: string;
}

// In-memory fallback if file system is read-only (e.g. some serverless environments)
let inMemoryStore: OtpRecord[] | null = null;

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'otp-store.json');

// Default initial records (pre-hashed with secure salts)
const INITIAL_HASHED_RECORDS: OtpRecord[] = [
  {
    id: 1,
    label: "OTP-01",
    passwordHash: "fe1ffc9256a68825c121eb962e6fde9efcb45ab3c5f06b8d5d1f6389dd51ba45",
    salt: "cec_otp_salt_1_753780fac9f17370",
    status: "AVAILABLE",
    usedAt: null,
    usedBy: null,
    usedIp: null,
    createdAt: "2026-09-13T15:50:49.000Z"
  },
  {
    id: 2,
    label: "OTP-02",
    passwordHash: "da03ecdc68d4703559302793892691fad4e2caf99c9fc95ad8f3eb3961367471",
    salt: "cec_otp_salt_2_5b14b4fc984ecb42",
    status: "AVAILABLE",
    usedAt: null,
    usedBy: null,
    usedIp: null,
    createdAt: "2026-09-13T15:50:49.000Z"
  },
  {
    id: 3,
    label: "OTP-03",
    passwordHash: "3d91ac05dd25af6eccada13a823322299722f81c983c5a70fa534a21b36e269b",
    salt: "cec_otp_salt_3_c7b867db982ce9ad",
    status: "AVAILABLE",
    usedAt: null,
    usedBy: null,
    usedIp: null,
    createdAt: "2026-09-13T15:50:49.000Z"
  },
  {
    id: 4,
    label: "OTP-04",
    passwordHash: "c48d3541329755b64864ec783a4e3273ca32060aef351daa7d88f24f6d9359ad",
    salt: "cec_otp_salt_4_faee7347613ae217",
    status: "AVAILABLE",
    usedAt: null,
    usedBy: null,
    usedIp: null,
    createdAt: "2026-09-13T15:50:49.000Z"
  },
  {
    id: 5,
    label: "OTP-05",
    passwordHash: "cdfca6908cc856510d8c645981826505c7029a47e489ed264978fd8975b1c59d",
    salt: "cec_otp_salt_5_db88dc1774e4360a",
    status: "AVAILABLE",
    usedAt: null,
    usedBy: null,
    usedIp: null,
    createdAt: "2026-09-13T15:50:49.000Z"
  },
  {
    id: 6,
    label: "OTP-06",
    passwordHash: "9bc8b946aac95058988af79ca1864b72801c2c4cda0b4c136bdf08aaeac67265",
    salt: "cec_otp_salt_6_a983b6596628687a",
    status: "AVAILABLE",
    usedAt: null,
    usedBy: null,
    usedIp: null,
    createdAt: "2026-09-13T15:50:49.000Z"
  },
  {
    id: 7,
    label: "OTP-07",
    passwordHash: "cc6b4772a951bfeffafa14f1710e10ab09ad07846ddc625b84436e0fbc898d25",
    salt: "cec_otp_salt_7_671e2e04e3e250e0",
    status: "AVAILABLE",
    usedAt: null,
    usedBy: null,
    usedIp: null,
    createdAt: "2026-09-13T15:50:49.000Z"
  },
  {
    id: 8,
    label: "OTP-08",
    passwordHash: "31a474b4fbae89f9c0caf68bb6c124df5aa85ea7c56eabbdf9cebfcb6c6e2d72",
    salt: "cec_otp_salt_8_72e6c03c0cd0254c",
    status: "AVAILABLE",
    usedAt: null,
    usedBy: null,
    usedIp: null,
    createdAt: "2026-09-13T15:50:49.000Z"
  },
  {
    id: 9,
    label: "OTP-09",
    passwordHash: "514e84cae519d72bd9d694b1d950365ce6b28f4f0a68e386c0c8e53f99c5d1af",
    salt: "cec_otp_salt_9_106227687e8e34c3",
    status: "AVAILABLE",
    usedAt: null,
    usedBy: null,
    usedIp: null,
    createdAt: "2026-09-13T15:50:49.000Z"
  },
  {
    id: 10,
    label: "OTP-10",
    passwordHash: "482b905276e8008f37b8234e44f55dd2fdcf9e94e0d10fce6f7ef2b298e80b8f",
    salt: "cec_otp_salt_10_6ec4d038b69ed9b0",
    status: "AVAILABLE",
    usedAt: null,
    usedBy: null,
    usedIp: null,
    createdAt: "2026-09-13T15:50:49.000Z"
  }
];

function loadStore(): OtpRecord[] {
  if (inMemoryStore) {
    return inMemoryStore;
  }

  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const content = fs.readFileSync(DATA_FILE_PATH, 'utf8');
      inMemoryStore = JSON.parse(content);
      return inMemoryStore || INITIAL_HASHED_RECORDS;
    }
  } catch (err) {
    console.warn('[OTP STORE] Could not read from file, using fallback store:', err);
  }

  inMemoryStore = [...INITIAL_HASHED_RECORDS];
  return inMemoryStore;
}

function saveStore(records: OtpRecord[]): void {
  inMemoryStore = records;
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(records, null, 2), 'utf8');
  } catch (err) {
    console.warn('[OTP STORE] Could not persist to disk, keeping in memory:', err);
  }
}

function timingSafeMatch(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Validates a one-time password input.
 * - If valid and AVAILABLE: marks it as USED immediately and returns SUCCESS.
 * - If matches an already USED password: returns ALREADY_USED.
 * - If no match: returns INVALID.
 */
export function verifyAndConsumeOtp(
  inputPassword: string,
  email: string,
  ip: string
): { success: boolean; reason: 'SUCCESS' | 'ALREADY_USED' | 'INVALID'; label?: string } {
  if (!inputPassword || typeof inputPassword !== 'string') {
    return { success: false, reason: 'INVALID' };
  }

  const records = loadStore();

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const candidateHash = crypto
      .createHash('sha256')
      .update(`${record.salt}:${inputPassword}`)
      .digest('hex');

    if (timingSafeMatch(candidateHash, record.passwordHash)) {
      if (record.status === 'USED') {
        console.warn(
          `[SECURITY AUDIT] Attempted reuse of OTP (${record.label}) for email: ${email} from IP: ${ip}. Used on: ${record.usedAt}`
        );
        return { success: false, reason: 'ALREADY_USED', label: record.label };
      }

      // Mark as USED immediately
      record.status = 'USED';
      record.usedAt = new Date().toISOString();
      record.usedBy = email;
      record.usedIp = ip;

      saveStore(records);

      console.info(
        `[SECURITY AUDIT] Successfully consumed OTP (${record.label}) for user: ${email} from IP: ${ip}`
      );
      return { success: true, reason: 'SUCCESS', label: record.label };
    }
  }

  return { success: false, reason: 'INVALID' };
}

/**
 * Returns safe status summaries of all OTPs for administrator view (without exposing hashes).
 */
export function getOtpStatusList() {
  const records = loadStore();
  return records.map((r) => ({
    id: r.id,
    label: r.label,
    status: r.status,
    usedAt: r.usedAt,
    usedBy: r.usedBy,
    createdAt: r.createdAt,
  }));
}

/**
 * Re-generates or resets a batch of OTPs with new passwords.
 */
export function resetOtpBatchWithNewPasswords(
  plainPasswords: Array<{ id: number; label: string; password: string }>
): OtpRecord[] {
  const newRecords: OtpRecord[] = plainPasswords.map((item) => {
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

  saveStore(newRecords);
  return newRecords;
}
