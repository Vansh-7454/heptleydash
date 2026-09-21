import ExcelJS from 'exceljs';
import { Customer, UserRole } from '@/types';

/**
 * Generates an ultra-premium, styled, colored Microsoft Excel (.xlsx) workbook
 * with large column widths, generous row heights, bold colored section headers,
 * vibrant status badge highlights, currency formatting, and automated totals.
 */
export async function exportCustomersToExcel(
  customers: Customer[],
  role: UserRole,
  filename?: string
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'heptley CRM';
  workbook.created = new Date();
  workbook.properties.date1904 = false;

  const isAdmin = role === 'admin';
  const sheetName = isAdmin ? 'Customer Directory' : 'My Client Portfolio';
  const worksheet = workbook.addWorksheet(sheetName, {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 3, showGridLines: true }],
    pageSetup: { fitToPage: true, orientation: 'landscape' },
  });

  // 1. Column Definitions with generous widths for clean display
  const columns = [
    { header: 'CUSTOMER ID', key: 'customerId', width: 22 },
    { header: 'CLIENT CONTACT', key: 'name', width: 32 },
    { header: 'COMPANY NAME', key: 'company', width: 38 },
    { header: 'WORK EMAIL', key: 'email', width: 38 },
    { header: 'PHONE NUMBER', key: 'phone', width: 24 },
    { header: 'ALTERNATE PHONE', key: 'alternatePhone', width: 24 },
    { header: 'LOCATION / CITY', key: 'location', width: 26 },
    { header: 'WEBSITE', key: 'website', width: 30 },
    { header: 'SERVICE DOMAIN', key: 'service', width: 34 },
    { header: 'PACKAGE TIER', key: 'package', width: 26 },
    { header: 'CONTRACT START DATE', key: 'startDate', width: 24 },
    { header: 'CONTRACT END DATE', key: 'endDate', width: 24 },
    { header: 'CONTRACT STATUS', key: 'status', width: 24 },
    { header: 'PROJECT STATUS', key: 'projectStatus', width: 24 },
    { header: 'ACCOUNT STATUS', key: 'customerStatus', width: 22 },
    { header: 'ASSIGNED SALES REP', key: 'salesMemberName', width: 30 },
    { header: 'REP ID', key: 'salesMemberId', width: 18 },
    { header: 'LEAD SOURCE', key: 'leadSource', width: 26 },
    { header: 'REMARKS & NOTES', key: 'notes', width: 44 },
    { header: 'ONBOARDING DATE', key: 'createdAt', width: 24 },
  ];

  worksheet.columns = columns.map((c) => ({ key: c.key, width: c.width }));

  // 2. Large Executive Title Banner (Row 1) - Height 44pt
  const titleRow = worksheet.getRow(1);
  titleRow.height = 44;
  worksheet.mergeCells(1, 1, 1, columns.length);
  const titleCell = titleRow.getCell(1);
  titleCell.value = isAdmin
    ? 'HEPTLEY ENTERPRISE CRM — EXECUTIVE MASTER CUSTOMER DIRECTORY'
    : 'HEPTLEY ENTERPRISE CRM — PERSONAL ASSIGNED CLIENT PORTFOLIO';
  titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0F172A' }, // Deep Midnight Slate 900
  };
  titleCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };

  // 3. Subtitle / Metadata Row (Row 2) - Height 24pt
  const subRow = worksheet.getRow(2);
  subRow.height = 24;
  worksheet.mergeCells(2, 1, 2, columns.length);
  const subCell = subRow.getCell(1);
  subCell.value = `Export Generated: ${new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST | ${isAdmin ? 'Total Company Records' : 'Personal Assigned Records'}: ${customers.length} Account(s)`;
  subCell.font = { name: 'Calibri', size: 10.5, italic: true, color: { argb: 'FFCBD5E1' } };
  subCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E293B' }, // Slate 800
  };
  subCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };

  // 4. Large, Bold, Colored Header Row (Row 3) - Height 38pt
  const headerRow = worksheet.getRow(3);
  headerRow.height = 38;

  columns.forEach((col, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = col.header;
    cell.font = { name: 'Calibri', size: 11.5, bold: true, color: { argb: 'FFFFFFFF' } };

    // Section-based vivid header colors
    let headerColor = 'FF1E3A8A'; // Default Navy Blue (Account Info)
    if (['startDate', 'endDate', 'status', 'projectStatus', 'customerStatus'].includes(col.key)) {
      headerColor = 'FF312E81'; // Indigo 900 (Lifecycle & Timeline)
    } else if (['salesMemberName', 'salesMemberId', 'leadSource'].includes(col.key)) {
      headerColor = 'FF0F766E'; // Teal 700 (Attribution)
    } else if (['notes', 'createdAt'].includes(col.key)) {
      headerColor = 'FF18181B'; // Zinc 900 (Audit & Remarks)
    }

    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: headerColor },
    };

    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };

    cell.border = {
      top: { style: 'medium', color: { argb: 'FFFFFFFF' } },
      bottom: { style: 'medium', color: { argb: 'FFFFFFFF' } },
      left: { style: 'thin', color: { argb: 'FF475569' } },
      right: { style: 'thin', color: { argb: 'FF475569' } },
    };
  });

  // 5. Data Rows with Large Heights (32pt), Alternating Fills & Bold Highlights
  if (customers.length === 0) {
    // Empty state row
    const emptyRow = worksheet.getRow(4);
    emptyRow.height = 36;
    worksheet.mergeCells(4, 1, 4, columns.length);
    const emptyCell = emptyRow.getCell(1);
    emptyCell.value = 'No customer accounts found in database. New customer records will appear here upon registration.';
    emptyCell.font = { name: 'Calibri', size: 11, italic: true, color: { argb: 'FF64748B' } };
    emptyCell.alignment = { vertical: 'middle', horizontal: 'center' };
    emptyCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
  } else {
    customers.forEach((c, index) => {
      const rowNumber = index + 4;
      const row = worksheet.getRow(rowNumber);
      row.height = 32; // Generous row height

      const isEven = index % 2 === 0;
      const defaultBg = isEven ? 'FFFFFFFF' : 'FFF8FAFC'; // Pure white vs soft ice tint

      const rowData: Record<string, any> = {
        customerId: c.customerId || c.id,
        name: c.name,
        company: c.company,
        email: c.email,
        phone: c.phone,
        alternatePhone: c.alternatePhone || '—',
        location: c.location || '—',
        website: c.website || '—',
        service: c.service,
        package: c.package || '—',
        startDate: c.startDate ? c.startDate.split('T')[0] : '—',
        endDate: c.endDate ? c.endDate.split('T')[0] : '—',
        status: c.status,
        projectStatus: c.projectStatus || '—',
        customerStatus: c.customerStatus || c.status,
        salesMemberName: c.salesMemberName || '—',
        salesMemberId: c.salesMemberId || '—',
        leadSource: c.leadSource || '—',
        notes: c.internalRemarks || c.notes || '—',
        createdAt: c.createdAt ? c.createdAt.split('T')[0] : '—',
      };

      columns.forEach((col, colIdx) => {
        const cell = row.getCell(colIdx + 1);
        const val = rowData[col.key];
        cell.value = val;
        cell.font = { name: 'Calibri', size: 11, color: { argb: 'FF1E293B' } };
        cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        };

        // Default cell fill
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: defaultBg },
        };

        // Customer ID Pill (High Visibility)
        if (col.key === 'customerId') {
          cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF0284C7' } };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        }

        // Status Pill Highlights (Vibrant colors + Bold text)
        if (col.key === 'status' || col.key === 'customerStatus' || col.key === 'projectStatus') {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          const sVal = String(val);
          if (['Active', 'Completed'].includes(sVal)) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } }; // Emerald 100
            cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF065F46' } }; // Emerald 800
          } else if (['Pending', 'In Progress', 'Planning'].includes(sVal)) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } }; // Amber 100
            cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF92400E' } }; // Amber 800
          } else if (['Overdue', 'On Hold', 'Cancelled', 'Inactive'].includes(sVal)) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } }; // Red 100
            cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF991B1B' } }; // Red 800
          } else if (['Onboarding', 'Review'].includes(sVal)) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2FE' } }; // Sky 100
            cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF0369A1' } }; // Sky 800
          }
        }

        // Dates Centering
        if (['startDate', 'endDate', 'createdAt'].includes(col.key)) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.font = { name: 'Calibri', size: 10.5, color: { argb: 'FF334155' } };
        }
      });
    });

    // 6. Summary Footer Row - Height 34pt
    if (customers.length > 0) {
      const summaryRowNum = customers.length + 4;
      const summaryRow = worksheet.getRow(summaryRowNum);
      summaryRow.height = 34;

      columns.forEach((col, colIdx) => {
        const cell = summaryRow.getCell(colIdx + 1);
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE2E8F0' }, // Slate 200
        };
        cell.border = {
          top: { style: 'double', color: { argb: 'FF0F172A' } },
          bottom: { style: 'double', color: { argb: 'FF0F172A' } },
          left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        };

        if (colIdx === 0) {
          cell.value = `${isAdmin ? 'TOTAL COMPANY ACCOUNTS' : 'TOTAL ASSIGNED ACCOUNTS'}: ${customers.length}`;
          cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF0F172A' } };
          cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        }
      });
    }
  }

  // 7. Write to buffer and trigger browser download
  const buffer = await workbook.xlsx.writeBuffer();
  const fileDate = new Date().toISOString().split('T')[0];
  const finalFilename = filename || (isAdmin ? `heptley_master_customers_${fileDate}.xlsx` : `heptley_assigned_customers_${fileDate}.xlsx`);

  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', finalFilename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 30000);
}

/**
 * Generates an executive, styled, colored Microsoft Excel (.xlsx) file for Payments
 * with large column widths, generous row heights, and bold highlights.
 */
export async function exportPaymentsToExcel(
  payments: any[],
  filename?: string
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'heptley CRM';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Payments Ledger', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 3, showGridLines: true }],
  });

  const columns = [
    { header: 'PAYMENT REF', key: 'paymentRef', width: 22 },
    { header: 'CUSTOMER ID', key: 'customerId', width: 20 },
    { header: 'CLIENT CONTACT', key: 'customerName', width: 32 },
    { header: 'COMPANY NAME', key: 'company', width: 38 },
    { header: 'AMOUNT RECEIVED (INR)', key: 'amountPaid', width: 28 },
    { header: 'TOTAL CONTRACT VALUE (INR)', key: 'totalAmount', width: 30 },
    { header: 'BALANCE REMAINING (INR)', key: 'remaining', width: 28 },
    { header: 'PAYMENT STATUS', key: 'paymentStatus', width: 24 },
    { header: 'PAYMENT METHOD', key: 'paymentMethod', width: 26 },
    { header: 'PAYMENT DATE', key: 'paymentDate', width: 24 },
    { header: 'DUE DATE', key: 'dueDate', width: 24 },
    { header: 'NOTES / REMARKS', key: 'notes', width: 44 },
  ];

  worksheet.columns = columns.map((c) => ({ key: c.key, width: c.width }));

  // Banner - Height 44pt
  worksheet.mergeCells(1, 1, 1, columns.length);
  const titleCell = worksheet.getRow(1).getCell(1);
  titleCell.value = 'HEPTLEY ENTERPRISE CRM — EXECUTIVE PAYMENTS & REVENUE LEDGER';
  titleCell.font = { name: 'Calibri', size: 15, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  worksheet.getRow(1).height = 44;

  // Subtitle - Height 24pt
  worksheet.mergeCells(2, 1, 2, columns.length);
  const subCell = worksheet.getRow(2).getCell(1);
  subCell.value = `Exported: ${new Date().toLocaleDateString('en-IN')} | Total Invoices & Receipts: ${payments.length}`;
  subCell.font = { name: 'Calibri', size: 10.5, italic: true, color: { argb: 'FFCBD5E1' } };
  subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
  subCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  worksheet.getRow(2).height = 24;

  // Headers - Height 38pt
  const headerRow = worksheet.getRow(3);
  headerRow.height = 38;
  columns.forEach((col, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = col.header;
    cell.font = { name: 'Calibri', size: 11.5, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: col.header.includes('(INR)') ? 'FF065F46' : 'FF0284C7' },
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: col.header.includes('(INR)') ? 'right' : 'center',
      wrapText: true,
    };
    cell.border = {
      top: { style: 'medium', color: { argb: 'FFFFFFFF' } },
      bottom: { style: 'medium', color: { argb: 'FFFFFFFF' } },
      left: { style: 'thin', color: { argb: 'FF475569' } },
      right: { style: 'thin', color: { argb: 'FF475569' } },
    };
  });

  // Data
  if (!payments || payments.length === 0) {
    const emptyRow = worksheet.getRow(4);
    emptyRow.height = 36;
    worksheet.mergeCells(4, 1, 4, columns.length);
    const emptyCell = emptyRow.getCell(1);
    emptyCell.value = 'No payment transactions recorded yet. Completed payments will appear here.';
    emptyCell.font = { name: 'Calibri', size: 11, italic: true, color: { argb: 'FF64748B' } };
    emptyCell.alignment = { vertical: 'middle', horizontal: 'center' };
    emptyCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
  } else {
    payments.forEach((p, index) => {
      const row = worksheet.getRow(index + 4);
      row.height = 32;
      const isEven = index % 2 === 0;

      const rowData: Record<string, any> = {
        paymentRef: p.paymentRef,
        customerId: p.customerId,
        customerName: p.customerName,
        company: p.company,
        amountPaid: p.amountPaid,
        totalAmount: p.totalAmount,
        remaining: p.remaining,
        paymentStatus: p.paymentStatus,
        paymentMethod: p.paymentMethod,
        paymentDate: p.paymentDate ? p.paymentDate.split('T')[0] : '—',
        dueDate: p.dueDate ? p.dueDate.split('T')[0] : '—',
        notes: p.notes || '—',
      };

      columns.forEach((col, colIdx) => {
        const cell = row.getCell(colIdx + 1);
        cell.value = rowData[col.key];
        cell.font = { name: 'Calibri', size: 11, color: { argb: 'FF1E293B' } };
        cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? 'FFFFFFFF' : 'FFF8FAFC' } };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        };

        if (['amountPaid', 'totalAmount', 'remaining'].includes(col.key)) {
          cell.numFmt = '[$₹-4009] #,##0';
          cell.alignment = { vertical: 'middle', horizontal: 'right', indent: 1 };
          if (col.key === 'amountPaid') {
            cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF047857' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECFDF5' } };
          }
          if (col.key === 'remaining' && Number(p.remaining) > 0) {
            cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFB91C1C' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF1F2' } };
          }
        }

        if (col.key === 'paymentStatus') {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          if (p.paymentStatus === 'Paid') {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
            cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF065F46' } };
          } else if (p.paymentStatus === 'Partial' || p.paymentStatus === 'Pending') {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
            cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF92400E' } };
          } else if (p.paymentStatus === 'Overdue') {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
            cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF991B1B' } };
          }
        }

        if (['paymentDate', 'dueDate', 'paymentRef', 'customerId'].includes(col.key)) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        }
      });
    });

    // Summary Row - Height 36pt
    const summaryRowNum = payments.length + 4;
    const summaryRow = worksheet.getRow(summaryRowNum);
    summaryRow.height = 36;
    columns.forEach((col, colIdx) => {
      const cell = summaryRow.getCell(colIdx + 1);
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
      cell.border = {
        top: { style: 'double', color: { argb: 'FF0F172A' } },
        bottom: { style: 'double', color: { argb: 'FF0F172A' } },
        left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      };
      if (colIdx === 0) {
        cell.value = 'TOTALS';
        cell.font = { name: 'Calibri', size: 11.5, bold: true, color: { argb: 'FF0F172A' } };
        cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      } else if (['amountPaid', 'totalAmount', 'remaining'].includes(col.key)) {
        const colLetter = worksheet.getColumn(colIdx + 1).letter;
        cell.value = { formula: `SUM(${colLetter}4:${colLetter}${summaryRowNum - 1})` };
        cell.numFmt = '[$₹-4009] #,##0';
        cell.font = { name: 'Calibri', size: 11.5, bold: true, color: { argb: 'FF0F172A' } };
        cell.alignment = { vertical: 'middle', horizontal: 'right', indent: 1 };
      }
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const fileDate = new Date().toISOString().split('T')[0];
  const finalFilename = filename || `heptley_payments_ledger_${fileDate}.xlsx`;

  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', finalFilename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 30000);
}
