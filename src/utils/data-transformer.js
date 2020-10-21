export const toCurrency = (value) => {
	return value.toLocaleString('en-AU', {
		style: 'currency',
		currency: 'AUD',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	});
};

export const toDecimal = (value) => {
	return value.toLocaleString('en-AU', {
		style: 'decimal'
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
