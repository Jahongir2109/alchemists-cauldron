const MINUS_SIGN = '−';

// "+25", "−18" (typographic minus) and "0".
export const formatSigned = (value: number): string => {
  if (value > 0) {
    return `+${String(value)}`;
  }

  if (value < 0) {
    return `${MINUS_SIGN}${String(Math.abs(value))}`;
  }

  return '0';
};

export const formatNumber = (value: number): string =>
  value < 0 ? `${MINUS_SIGN}${String(Math.abs(value))}` : String(value);
