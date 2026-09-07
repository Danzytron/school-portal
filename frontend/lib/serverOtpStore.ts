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
    passwordHash: "5b596232230da3a79d34346eb41ef11df248107ef3f269a8e0f6b43d3b7bc1ca",
    salt: "cec_otp_salt_1_744a539bc2eb6ecf",
    status: "AVAILABLE",
    usedAt: null,
    usedBy: null,
    usedIp: null,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    label: "OTP-02",
    passwordHash: "7fe75825cfd4957e849ea2e0a2944b5b719485b0d62d29f8f2b7b51b32f2ecdf",
    salt: "cec_otp_salt_2_96784d0b2f6ef329",
    status: "AVAILABLE",
    usedAt: null,
    usedBy: null,
    usedIp: null,
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    label: "OTP-03",
    passwordHash: "3f338d1e2e7b4cf03ebff8e1a8bb86259d682dd93d0bb2a8c3d9b04fc9f61b0a",
    salt: "cec_otp_salt_3_b867c29e6be2069e",
    status: "AVAILABLE",
    usedAt: null,
    usedBy: null,
    usedIp: null,
    createdAt: new Date().toISOString()
  },
  {
    id: 4,
    label: "OTP-04",
    passwordHash: "542a2221b681f2162464731a590b84c798642730623c28c68832a819bdfbe2ff",
    salt: "cec_otp_salt_4_3e6ffb9281a8c082",
    status: "AVAILABLE",
    usedAt: null,
    usedBy: null,
    usedIp: null,
    createdAt: new Date().toISOString()
  },
  {
    id: 5,
    label: "OTP-05",
    passwordHash: "c0ca5e60803c621e25e98586adfd4f9c5f854378f8cb64426511d7f6c770c0c6",
    salt: "cec_otp_salt_5_85c95ef3998b3c8f",
    status: "AVAILABLE",
    usedAt: null,
    usedBy: null,
    usedIp: null,
    createdAt: new Date().toISOString()
  },
  {
    id: 6,
    label: "OTP-06",
    passwordHash: "c0d38379ba9ee00df0b5dbdd7fe4e1da2c0ec7ecfeea6344d5c317ffce2ba6cb",
    salt: "cec_otp_salt_6_ee3f7e53f1f72cf2",
    status: "AVAILABLE",
    usedAt: null,
    usedBy: null,
    usedIp: null,
    createdAt: new Date().toISOString()
  },
  {
    id: 7,
    label: "OTP-07",
    passwordHash: "a68f6350d750c1842eb3519d14ec9e97f90f22d4f203893699c828fe6fbbcb6f",
    salt: "cec_otp_salt_7_7e1634b8c6be3f0c",
    status: "AVAILABLE",
    usedAt: null,
    usedBy: null,
    usedIp: null,
    createdAt: new Date().toISOString()
  },
  {
    id: 8,
    label: "OTP-08",
    passwordHash: "df2146ae9b5e52332dfa93e36e4f3a9a1d2938c5b96ee3dc7d8894df05be80f8",
    salt: "cec_otp_salt_8_be6520f9a2d2a45a",
    status: "AVAILABLE",
    usedAt: null,
    usedBy: null,
    usedIp: null,
    createdAt: new Date().toISOString()
  },
  {
    id: 9,
    label: "OTP-09",
    passwordHash: "7e502573ca0c5cb2ec73fa2ec6bf93d8b3684a0d9571e0655e1005a9c3132bc6",
    salt: "cec_otp_salt_9_3ceb9f626ba0a324",
    status: "AVAILABLE",
    usedAt: null,
    usedBy: null,
    usedIp: null,
    createdAt: new Date().toISOString()
  },
  {
    id: 10,
    label: "OTP-10",
    passwordHash: "b6f505e60803fc5389caee2efc530467cf395722a969b82ba63f03b8e7279cb6",
    salt: "cec_otp_salt_10_593cb8f7d98399e5",
    status: "AVAILABLE",
    usedAt: null,
    usedBy: null,
    usedIp: null,
    createdAt: new Date().toISOString()
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
