/**
 * Localization Constants
 */

export const CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "INR",
  "JPY",
  "CAD",
  "AUD",
  "SGD",
];

export const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Kolkata",
  "Australia/Sydney",
];

export const TIMEZONE_OPTIONS = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "London Time (GMT)" },
  { value: "Europe/Paris", label: "Paris Time (CET)" },
  { value: "Asia/Tokyo", label: "Tokyo Time (JST)" },
  { value: "Asia/Shanghai", label: "Shanghai Time (CST)" },
  { value: "Asia/Kolkata", label: "India Time (IST)" },
  { value: "Australia/Sydney", label: "Sydney Time (AEDT)" },
];

export const LANGUAGES = [
  "en",
  "es",
  "fr",
  "de",
  "it",
  "pt",
  "ja",
  "zh",
  "ko",
  "ar",
];

export const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "ja", label: "Japanese" },
  { value: "zh", label: "Chinese" },
  { value: "ko", label: "Korean" },
  { value: "ar", label: "Arabic" },
];

export const DATE_FORMATS = [
  "MM/DD/YYYY",
  "DD/MM/YYYY", 
  "YYYY-MM-DD",
  "DD-MM-YYYY",
];

export const DATE_FORMAT_OPTIONS = [
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
  { value: "DD-MM-YYYY", label: "DD-MM-YYYY" },
];

export const TIME_FORMATS = [
  "12h",
  "24h",
];

export const TIME_FORMAT_OPTIONS = [
  { value: "12h", label: "12 Hour (AM/PM)" },
  { value: "24h", label: "24 Hour" },
];

export const DEFAULT_LANGUAGE = "en";
export const DEFAULT_TIMEZONE = "UTC";
export const DEFAULT_DATE_FORMAT = "MM/DD/YYYY";
export const DEFAULT_TIME_FORMAT = "12h";
