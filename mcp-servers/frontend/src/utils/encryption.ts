import CryptoJS from "crypto-js";

// Use a secure key derivation from environment variables or generate one
const ENCRYPTION_KEY =
  process.env.NEXT_PUBLIC_ENCRYPTION_KEY ||
  CryptoJS.SHA256(window.location.hostname).toString();

/**
 * Encrypts sensitive data using AES encryption
 * @param data - The data to encrypt
 * @returns The encrypted data as a string
 */
export function encrypt(data: string): string {
  try {
    return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt data");
  }
}

/**
 * Decrypts encrypted data using AES decryption
 * @param encryptedData - The encrypted data to decrypt
 * @returns The decrypted data as a string
 */
export function decrypt(encryptedData: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt data");
  }
}

/**
 * Validates if a string is properly encrypted
 * @param encryptedData - The encrypted data to validate
 * @returns boolean indicating if the data is properly encrypted
 */
export function isValidEncryption(encryptedData: string): boolean {
  try {
    const decrypted = decrypt(encryptedData);
    return decrypted.length > 0;
  } catch {
    return false;
  }
}
