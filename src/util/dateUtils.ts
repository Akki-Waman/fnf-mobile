// src/util/dateUtils.ts

/**
 * Global Minimum & Maximum date bounds for DatePicker controls.
 * Explicitly setting minimumDate to Jan 1, 1900 prevents native Android/iOS 
 * DatePickerDialogs from defaulting minDate to Unix Epoch 0 (Jan 1, 1970).
 */
export const MIN_DATE_PICKER = new Date(1900, 0, 1);
export const MAX_DATE_PICKER = new Date();

/**
 * Formats a Date object to YYYY-MM-DD string in LOCAL timezone.
 * Avoids .toISOString() timezone shift bugs (which shift dates back -1 day in UTC+ timezones).
 */
export const formatDateToYYYYMMDD = (date?: Date | null): string => {
  if (!date || isNaN(date.getTime())) {
    const fallback = new Date(1995, 0, 1);
    return `${fallback.getFullYear()}-01-01`;
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Parses a YYYY-MM-DD string (or ISO date string) into a local Date object.
 * Prevents timezone offset shifts when dates like "1965-05-15" are constructed.
 */
export const parseYYYYMMDDToDate = (dateStr?: string | null, defaultYear = 1995): Date => {
  if (!dateStr || typeof dateStr !== 'string') {
    return new Date(defaultYear, 0, 1);
  }
  const cleanStr = dateStr.trim();
  const match = cleanStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const day = parseInt(match[3], 10);
    const dateObj = new Date(year, month, day);
    if (!isNaN(dateObj.getTime())) {
      return dateObj;
    }
  }

  const parsed = new Date(cleanStr);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }
  return new Date(defaultYear, 0, 1);
};

/**
 * Formats a Date object or date string for clean UI display (e.g., "15 May 1965").
 */
export const formatDateDisplay = (dateInput?: Date | string | null): string => {
  if (!dateInput) return '';
  const dateObj = typeof dateInput === 'string' ? parseYYYYMMDDToDate(dateInput) : dateInput;
  if (!dateObj || isNaN(dateObj.getTime())) return '';
  return dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};
