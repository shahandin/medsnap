const ENCRYPTION_KEY = process.env.PHI_ENCRYPTION_KEY || "default-key-for-development-only"
const ALGORITHM = "AES-GCM"

export interface EncryptedField {
  encrypted: string
  iv: string
}

async function getKey(): Promise<CryptoKey> {
  const cryptoAPI = globalThis.crypto
  if (!cryptoAPI) {
    throw new Error("Web Crypto API not available")
  }

  const keyMaterial = new TextEncoder().encode(ENCRYPTION_KEY)
  const key = await cryptoAPI.subtle.importKey(
    "raw",
    keyMaterial.slice(0, 32), // Ensure 32 bytes for AES-256
    { name: ALGORITHM },
    false,
    ["encrypt", "decrypt"],
  )
  return key
}

export async function encryptPHI(data: string): Promise<EncryptedField> {
  // Only encrypt on server-side
  if (typeof window !== "undefined") {
    throw new Error("PHI encryption must only happen server-side")
  }

  const cryptoAPI = globalThis.crypto
  if (!cryptoAPI) {
    throw new Error("Web Crypto API not available")
  }

  const key = await getKey()
  const iv = cryptoAPI.getRandomValues(new Uint8Array(12)) // 12 bytes for GCM
  const encodedData = new TextEncoder().encode(data)

  const encrypted = await cryptoAPI.subtle.encrypt({ name: ALGORITHM, iv }, key, encodedData)

  return {
    encrypted: Array.from(new Uint8Array(encrypted))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(""),
    iv: Array.from(iv)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(""),
  }
}

export async function decryptPHI(encryptedField: EncryptedField): Promise<string> {
  // Only decrypt on server-side
  if (typeof window !== "undefined") {
    throw new Error("PHI decryption must only happen server-side")
  }

  const cryptoAPI = globalThis.crypto
  if (!cryptoAPI) {
    throw new Error("Web Crypto API not available")
  }

  const key = await getKey()
  const iv = new Uint8Array(encryptedField.iv.match(/.{2}/g)?.map((byte) => Number.parseInt(byte, 16)) || [])
  const encryptedData = new Uint8Array(
    encryptedField.encrypted.match(/.{2}/g)?.map((byte) => Number.parseInt(byte, 16)) || [],
  )

  const decrypted = await cryptoAPI.subtle.decrypt({ name: ALGORITHM, iv }, key, encryptedData)

  return new TextDecoder().decode(decrypted)
}

const PHI_FIELDS = [
  "firstName",
  "lastName",
  "dateOfBirth",
  "ssn",
  "address",
  "phone",
  "email",
  "healthInsurance",
  "medicalConditions",
  "disability",
  "pregnancy",
  "householdMembers",
  "medicalBills",
  "longTermCare",
]

export async function encryptApplicationData(applicationData: any): Promise<any> {
  const encrypted = { ...applicationData }

  // Encrypt personal information
  if (encrypted.personalInfo) {
    encrypted.personalInfo = await encryptPHIObject(encrypted.personalInfo)
  }

  // Encrypt health/disability information
  if (encrypted.healthDisability) {
    encrypted.healthDisability = await encryptPHIObject(encrypted.healthDisability)
  }

  // Encrypt household member data
  if (encrypted.householdInfo?.members) {
    encrypted.householdInfo.members = await Promise.all(encrypted.householdInfo.members.map(encryptPHIObject))
  }

  return encrypted
}

export async function decryptApplicationData(encryptedData: any): Promise<any> {
  const decrypted = { ...encryptedData }

  // Decrypt personal information
  if (decrypted.personalInfo) {
    decrypted.personalInfo = await decryptPHIObject(decrypted.personalInfo)
  }

  // Decrypt health/disability information
  if (decrypted.healthDisability) {
    decrypted.healthDisability = await decryptPHIObject(decrypted.healthDisability)
  }

  // Decrypt household member data
  if (decrypted.householdInfo?.members) {
    decrypted.householdInfo.members = await Promise.all(decrypted.householdInfo.members.map(decryptPHIObject))
  }

  return decrypted
}

async function encryptPHIObject(obj: any): Promise<any> {
  const encrypted = { ...obj }

  for (const key of Object.keys(encrypted)) {
    if (typeof encrypted[key] === "string" && encrypted[key].length > 0) {
      // Encrypt string fields that contain PHI
      if (isPHIField(key) || containsPHI(encrypted[key])) {
        encrypted[key] = await encryptPHI(encrypted[key])
      }
    } else if (typeof encrypted[key] === "object" && encrypted[key] !== null) {
      encrypted[key] = await encryptPHIObject(encrypted[key])
    }
  }

  return encrypted
}

async function decryptPHIObject(obj: any): Promise<any> {
  const decrypted = { ...obj }

  for (const key of Object.keys(decrypted)) {
    if (decrypted[key] && typeof decrypted[key] === "object" && decrypted[key].encrypted) {
      // This is an encrypted field
      decrypted[key] = await decryptPHI(decrypted[key])
    } else if (typeof decrypted[key] === "object" && decrypted[key] !== null) {
      decrypted[key] = await decryptPHIObject(decrypted[key])
    }
  }

  return decrypted
}

function isPHIField(fieldName: string): boolean {
  return PHI_FIELDS.some((phi) => fieldName.toLowerCase().includes(phi.toLowerCase()))
}

function containsPHI(value: string): boolean {
  // Basic PHI detection patterns
  const patterns = [
    /\d{3}-\d{2}-\d{4}/, // SSN pattern
    /\d{10,}/, // Phone number pattern
    /@.*\.(com|org|net|edu|gov)/, // Email pattern
    /\d{1,2}\/\d{1,2}\/\d{4}/, // Date pattern
  ]

  return patterns.some((pattern) => pattern.test(value))
}
