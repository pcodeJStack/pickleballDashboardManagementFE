// utils.ts
export const isValidHttpImageUrl = (value?: string) => {
  if (!value || !value.trim()) return false;

  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

export const normalizeImageUrl = (value?: string) => {
  const raw = value?.trim();
  if (!raw) return null;

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw;
  }

  if (raw.startsWith("//")) {
    return `https:${raw}`;
  }

  if (raw.startsWith("/")) {
    if (typeof window !== "undefined") {
      return `${window.location.origin}${raw}`;
    }
    return raw;
  }

  if (raw.includes(".")) {
    return `https://${raw}`;
  }

  return null;
};