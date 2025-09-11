// Format helpers with side effects
import {
  formatUserData,
  formatAuditLogData,
  formatOrganizationData,
} from "@/lib/utils/format-utils";

export const cleanUserResponse = (user) => {
  const userResponse = user.toJSON ? user.toJSON() : { ...user };
  delete userResponse.password;
  delete userResponse.inviteToken;
  delete userResponse.__v;
  return userResponse;
};

export { formatUserData, formatAuditLogData, formatOrganizationData };
