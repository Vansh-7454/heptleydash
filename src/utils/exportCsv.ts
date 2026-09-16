/**
 * Utility to export JavaScript objects to a downloadable CSV file.
 * Handles quoting, commas, and automatic browser download.
 */
export function exportToCsv<T extends Record<string, any>>(
  filename: string,
  rows: T[],
  headers: { key: keyof T; label: string }[]
) {
  if (!rows || rows.length === 0) return;

  const headerRow = headers.map((h) => `"${h.label.replace(/"/g, '""')}"`).join(',');
  const dataRows = rows.map((row) =>
    headers
      .map((h) => {
        const val = row[h.key] ?? '';
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(',')
  );

  const csvContent = [headerRow, ...dataRows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
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
