/**
 * File Upload Validation
 * Client-side validation for file uploads (driver docs, KYC, menu photos)
 */

export const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);

export const ALLOWED_DOCUMENT_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const MAX_FILENAME_LENGTH = 200;
const DANGEROUS_CHARS = /[<>:"/\\|?*\x00-\x1f]/g;
const PATH_TRAVERSAL = /\.\.\//g;

export interface UploadValidationOptions {
  allowedTypes?: Set<string>;
  maxSizeMB?: number;
  maxFileNameLength?: number;
}

export interface UploadValidationResult {
  valid: boolean;
  errors: string[];
  sanitizedName?: string;
}

/**
 * Validate file MIME type against whitelist
 */
export function validateFileType(file: File, allowedTypes: Set<string>): boolean {
  return allowedTypes.has(file.type);
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxSizeMB: number): boolean {
  return file.size <= maxSizeMB * 1024 * 1024;
}

/**
 * Sanitize filename - strip dangerous chars, path traversal, limit length
 */
export function sanitizeFileName(name: string): string {
  let sanitized = name
    .replace(PATH_TRAVERSAL, '')
    .replace(DANGEROUS_CHARS, '_')
    .replace(/\s+/g, '_')
    .replace(/_{2,}/g, '_')
    .trim();

  // Limit length while preserving extension
  const dotIndex = sanitized.lastIndexOf('.');
  const maxBase = MAX_FILENAME_LENGTH - (dotIndex >= 0 ? sanitized.length - dotIndex : 0);
  
  if (dotIndex >= 0 && sanitized.length > MAX_FILENAME_LENGTH) {
    const ext = sanitized.slice(dotIndex);
    sanitized = sanitized.slice(0, maxBase) + ext;
  } else if (sanitized.length > MAX_FILENAME_LENGTH) {
    sanitized = sanitized.slice(0, MAX_FILENAME_LENGTH);
  }

  return sanitized || 'unnamed_file';
}

/**
 * Combined upload validator
 */
export function validateUpload(
  file: File,
  options: UploadValidationOptions = {}
): UploadValidationResult {
  const {
    allowedTypes = ALLOWED_IMAGE_TYPES,
    maxSizeMB = 10,
  } = options;

  const errors: string[] = [];

  if (!validateFileType(file, allowedTypes)) {
    const allowed = Array.from(allowedTypes).map(t => t.split('/')[1]).join(', ');
    errors.push(`File type "${file.type || 'unknown'}" not allowed. Accepted: ${allowed}`);
  }

  if (!validateFileSize(file, maxSizeMB)) {
    errors.push(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum: ${maxSizeMB}MB`);
  }

  const sanitizedName = sanitizeFileName(file.name);

  return {
    valid: errors.length === 0,
    errors,
    sanitizedName,
  };
}
