type CsvCell = string | number | boolean | null | undefined;

export interface WorkbookSheetDefinition {
  name: string;
  rows: CsvCell[][];
  columnWidths?: number[];
}

const normalizeCell = (value: CsvCell): string | number | boolean => {
  if (value === null || value === undefined) {
    return '';
  }

  return value;
};

const escapeCsvCell = (value: CsvCell) => {
  const normalized = String(normalizeCell(value)).replace(/"/g, '""');
  return `"${normalized}"`;
};

export const buildDatedFilename = (prefix: string, extension: 'csv' | 'xlsx') =>
  `${prefix}-${new Date().toISOString().split('T')[0]}.${extension}`;

const triggerBlobDownload = (filename: string, blob: Blob) => {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const buildCsvContent = (headers: string[], rows: CsvCell[][]) => [
  headers.map(escapeCsvCell).join(','),
  ...rows.map((row) => row.map(escapeCsvCell).join(',')),
].join('\n');

/**
 * Generates a CSV file from an array of arrays and triggers a download.
 */
export const downloadCSV = (filename: string, headers: string[], rows: CsvCell[][]) => {
  const csvContent = buildCsvContent(headers, rows);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerBlobDownload(filename, blob);
};

const getColumnWidths = (rows: CsvCell[][], explicitWidths?: number[]) => {
  if (explicitWidths?.length) {
    return explicitWidths.map((width) => ({ wch: width }));
  }

  const columnCount = Math.max(...rows.map((row) => row.length), 0);
  return Array.from({ length: columnCount }, (_, index) => ({
    wch: Math.min(
      80,
      Math.max(
        12,
        ...rows.map((row) => String(normalizeCell(row[index])).length + 2),
      ),
    ),
  }));
};

export const downloadWorkbook = async (filename: string, sheets: WorkbookSheetDefinition[]) => {
  const XLSX = await import('xlsx');
  const workbook = XLSX.utils.book_new();

  sheets.forEach((sheet) => {
    const worksheet = XLSX.utils.aoa_to_sheet(
      sheet.rows.map((row) => row.map(normalizeCell)),
    );
    worksheet['!cols'] = getColumnWidths(sheet.rows, sheet.columnWidths);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
  });

  XLSX.writeFile(workbook, filename);
};
