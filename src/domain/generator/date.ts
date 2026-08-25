export interface ParsedUtcDate {
  readonly day: number;
  readonly month: number;
  readonly year: number;
}

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/u;

export function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function daysInMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

export function parseUtcDate(value: string): ParsedUtcDate {
  const match = DATE_PATTERN.exec(value);
  if (!match) throw new RangeError('dateUtc must use strict YYYY-MM-DD format.');
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1 || year > 9999 || month < 1 || month > 12) {
    throw new RangeError('dateUtc is outside the supported calendar range.');
  }
  if (day < 1 || day > daysInMonth(year, month)) {
    throw new RangeError('dateUtc contains an invalid calendar day.');
  }
  return Object.freeze({ day, month, year });
}

function daysBeforeYear(year: number): number {
  const completedYears = year - 1;
  return (
    completedYears * 365 +
    Math.floor(completedYears / 4) -
    Math.floor(completedYears / 100) +
    Math.floor(completedYears / 400)
  );
}

function dayOfYear(date: ParsedUtcDate): number {
  let result = date.day;
  for (let month = 1; month < date.month; month += 1) {
    result += daysInMonth(date.year, month);
  }
  return result;
}

export function utcDateOrdinal(value: string): number {
  const date = parseUtcDate(value);
  return daysBeforeYear(date.year) + dayOfYear(date) - 1;
}

function formatDate(date: ParsedUtcDate): string {
  return `${date.year.toString().padStart(4, '0')}-${date.month
    .toString()
    .padStart(2, '0')}-${date.day.toString().padStart(2, '0')}`;
}

function dateFromOrdinal(ordinal: number): ParsedUtcDate {
  const maximumOrdinal = daysBeforeYear(10_000) - 1;
  if (!Number.isInteger(ordinal) || ordinal < 0 || ordinal > maximumOrdinal) {
    throw new RangeError('Resulting date is outside 0001-01-01..9999-12-31.');
  }

  let lower = 1;
  let upper = 10_000;
  while (lower + 1 < upper) {
    const middle = Math.floor((lower + upper) / 2);
    if (daysBeforeYear(middle) <= ordinal) lower = middle;
    else upper = middle;
  }
  const year = lower;
  let remaining = ordinal - daysBeforeYear(year);
  let month = 1;
  while (remaining >= daysInMonth(year, month)) {
    remaining -= daysInMonth(year, month);
    month += 1;
  }
  return { day: remaining + 1, month, year };
}

export function addUtcDays(value: string, offset: number): string {
  if (!Number.isInteger(offset)) throw new RangeError('offset must be an integer number of days.');
  return formatDate(dateFromOrdinal(utcDateOrdinal(value) + offset));
}

export function isoWeekday(value: string): number {
  return (utcDateOrdinal(value) % 7) + 1;
}

export function compareUtcDates(left: string, right: string): number {
  const leftOrdinal = utcDateOrdinal(left);
  const rightOrdinal = utcDateOrdinal(right);
  return Math.sign(leftOrdinal - rightOrdinal);
}
