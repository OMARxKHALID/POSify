import { apiClient } from "@/lib/api-client";
import { auditLogsResponseSchema } from "../schemas/audit.schema";
import { handleServiceError } from "@/lib/utils/error-handler";

export const auditService = {
  getAuditLogs: async (filters = {}) => {
    try {
      const response = await apiClient.get("/dashboard/audit-logs", {
        params: filters,
      });
      return auditLogsResponseSchema.parse(response.data);
    } catch (error) {
      handleServiceError(error);
    }
  },
};