import { apiClient } from "@/lib/api-client";
import { auditLogsResponseSchema } from "../schemas/audit.schema";

export const auditService = {
  getAuditLogs: async (filters = {}) => {
    const response = await apiClient.get("/dashboard/audit-logs", {
      params: filters,
    });
    return auditLogsResponseSchema.parse(response.data);
  },
};