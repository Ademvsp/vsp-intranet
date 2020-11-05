export const toCurrency = (value, fractionDigits) => {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: fractionDigits || 0,
    maximumFractionDigits: fractionDigits || 0
  });
};

export const toDecimal = (value, fractionDigits) => {
  return value.toLocaleString('en-AU', {
    style: 'decimal',
    minimumFractionDigits: fractionDigits || 0,
    maximumFractionDigits: fractionDigits || 0
  });
};

export const toPercentage = (value, fractionDigits) => {
  const newValue = value / 100;
  return newValue.toLocaleString('en-AU', {
    style: 'percent',
    minimumFractionDigits: fractionDigits || 0,
    maximumFractionDigits: fractionDigits || 0
  });
};

export const toReadableFilesize = (b) => {
  const KB = 1024;
  const MB = Math.pow(KB, 2);
  const GB = Math.pow(KB, 3);
  if (b >= GB) {
    return `${(b / GB).toFixed(2)} GB`;
  }
  if (b >= MB) {
    return `${(b / MB).toFixed(2)} MB`;
  }
  if (b >= KB) {
    return `${(b / KB).toFixed(2)} KB`;
  }
  return `${b} B`;
};
