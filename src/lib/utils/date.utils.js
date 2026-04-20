import { format, parseISO, isValid } from "date-fns";

export const safeFormatDate = (dateValue, pattern = "MMM dd, yyyy") => {
  if (!dateValue) return "N/A";
  
  let date;
  try {
    if (typeof dateValue === "string") {
      date = parseISO(dateValue);
    } else {
      date = new Date(dateValue);
    }
    
    if (!isValid(date)) return "N/A";
    return format(date, pattern);
  } catch {
    return "N/A";
  }
};

export const safeFormatDateTime = (dateValue) => {
  return safeFormatDate(dateValue, "MMM dd, yyyy 'at' h:mm a");
};

export const safeFormatTime = (dateValue) => {
  return safeFormatDate(dateValue, "HH:mm:ss");
};

export const safeParseDate = (dateValue) => {
  if (!dateValue) return null;
  
  try {
    if (typeof dateValue === "string") {
      const parsed = parseISO(dateValue);
      return isValid(parsed) ? parsed : null;
    }
    const date = new Date(dateValue);
    return isValid(date) ? date : null;
  } catch {
    return null;
  }
};