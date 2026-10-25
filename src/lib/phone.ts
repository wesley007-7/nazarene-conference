export function normalizePhone(rawPhone: string): string {
  if (!rawPhone) return '';
  const trimmed = rawPhone.trim();
  const digits = trimmed.replace(/\D/g, '');

  if (digits.startsWith('254') && (digits.length === 12 || digits.length === 13)) {
    return `+${digits}`;
  }
  if (digits.startsWith('0') && digits.length === 10) {
    return `+254${digits.substring(1)}`;
  }
  if (digits.length === 9) {
    return `+254${digits}`;
  }

  return trimmed.startsWith('+') ? `+${digits}` : (digits ? `+${digits}` : trimmed);
}

export function getPhoneVariants(rawPhone: string): string[] {
  if (!rawPhone) return [];
  const normalized = normalizePhone(rawPhone);
  const digits = rawPhone.replace(/\D/g, '');
  const variants = new Set<string>();

  if (rawPhone.trim()) variants.add(rawPhone.trim());
  if (normalized) variants.add(normalized);
  if (digits) {
    variants.add(digits);
    variants.add(`+${digits}`);
    if (digits.startsWith('254') && digits.length >= 12) {
      variants.add(`0${digits.substring(3)}`);
      variants.add(digits.substring(3));
    } else if (digits.startsWith('0') && digits.length === 10) {
      variants.add(`+254${digits.substring(1)}`);
      variants.add(`254${digits.substring(1)}`);
      variants.add(digits.substring(1));
    }
  }

  return Array.from(variants).filter(Boolean);
}

