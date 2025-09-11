// API authentication utilities
import { conflict, notFound } from "./response-utils";
import {
  checkUserExists as checkUserExistsHelper,
  validateOrganizationExists as validateOrganizationExistsHelper,
} from "@/lib/helpers/auth-helpers";

export const checkUserExists = async (
  email,
  conflictMessage = "USER_EXISTS"
) => {
  const result = await checkUserExistsHelper(email, conflictMessage);
  if (result?.error) {
    return conflict(result.code);
  }
  return null;
};

export const validateOrganizationExists = async (currentUser) => {
  const result = await validateOrganizationExistsHelper(currentUser);
  if (result?.error) {
    return notFound(result.code);
  }
  return result;
};
