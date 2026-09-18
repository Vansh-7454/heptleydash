/**
 * Utility to export data to a downloadable CSV file.
 * Handles RFC-4180 escaping (commas, quotes, newlines), UTF-8 BOM for Excel,
 * and automatic browser download.
 */
export function exportToCsv<T extends Record<string, any>>(
  filename: string,
  rows: T[],
  headers: { key: keyof T; label: string }[]
) {
  if (!rows || rows.length === 0) return;

  const escapeCell = (val: any): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerRow = headers.map((h) => escapeCell(h.label)).join(',');
  const dataRows = rows.map((row) =>
    headers.map((h) => escapeCell(row[h.key])).join(',')
  );

  downloadCsvContent(filename, [headerRow, ...dataRows].join('\r\n'));
}

/**
 * Direct matrix export for customized headers and cells.
 */
export function exportMatrixToCsv(filename: string, headers: string[], rows: (string | number | undefined | null)[][]) {
  if (!rows || rows.length === 0) return;

  const escapeCell = (val: any): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerRow = headers.map(escapeCell).join(',');
  const dataRows = rows.map((row) => row.map(escapeCell).join(','));

  downloadCsvContent(filename, [headerRow, ...dataRows].join('\r\n'));
}

function downloadCsvContent(filename: string, csvBody: string) {
  // \uFEFF is the UTF-8 Byte Order Mark (BOM) ensuring Excel displays UTF-8 strings accurately
  const blob = new Blob(['\uFEFF' + csvBody], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

