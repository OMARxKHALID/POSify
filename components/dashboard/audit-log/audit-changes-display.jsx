"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Plus, Minus, Edit, AlertCircle } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";


export function AuditChangesDisplay({ changes, resource, action }) {
  const highlightedChanges = useMemo(() => {
    if (!changes) return null;


    if (changes.before && changes.after) {
      return compareObjects(changes.before, changes.after, resource, action);
    } else if (changes.after) {
      return { added: changes.after };
    } else if (changes.before) {
      return { removed: changes.before };
    }

    return null;
  }, [changes, resource, action]);

  if (!highlightedChanges) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-foreground">Raw Changes</span>
          </div>
          <div className="bg-muted/50 rounded-md p-3 border border-border/50">
            <pre className="text-sm overflow-auto max-h-32 whitespace-pre-wrap font-mono text-muted-foreground">
              {JSON.stringify(changes, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">

      {highlightedChanges.added &&
        Object.keys(highlightedChanges.added).length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Plus className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="font-medium text-foreground">
                  Added Fields
                </span>
              </div>
              <div className="bg-muted/50 rounded-md p-3 border border-border/50">
                <pre className="text-sm overflow-auto max-h-32 whitespace-pre-wrap font-mono text-muted-foreground">
                  {JSON.stringify(highlightedChanges.added, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}


      {highlightedChanges.removed &&
        Object.keys(highlightedChanges.removed).length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Minus className="h-4 w-4 text-red-500 dark:text-red-400" />
                <span className="font-medium text-foreground">
                  Removed Fields
                </span>
              </div>
              <div className="bg-muted/50 rounded-md p-3 border border-border/50">
                <pre className="text-sm overflow-auto max-h-32 whitespace-pre-wrap font-mono text-muted-foreground">
                  {JSON.stringify(highlightedChanges.removed, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}


      {highlightedChanges.modified &&
        Object.keys(highlightedChanges.modified).length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Edit className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-foreground">
                  Modified Fields
                </span>
              </div>
              <div className="space-y-4">
                {Object.entries(highlightedChanges.modified)
                  .sort(
                    ([, a], [, b]) =>
                      (b.isImportant ? 1 : 0) - (a.isImportant ? 1 : 0)
                  )
                  .map(([field, change]) => (
                    <div
                      key={field}
                      className="border border-border/50 rounded-md p-3 bg-muted/20"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Badge
                          variant="outline"
                          className="text-xs border-border/50"
                        >
                          {field}
                        </Badge>
                        {change.isImportant && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-900 dark:text-orange-100 border-orange-200 dark:border-orange-800"
                          >
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Critical
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center gap-1 mb-2">
                            <Minus className="h-3 w-3 text-red-500 dark:text-red-400" />
                            <span className="text-sm font-medium text-foreground">
                              Before
                            </span>
                          </div>
                          <div className="bg-red-500/5 dark:bg-red-500/10 border-red-500/20 dark:border-red-500/30 rounded-md p-2 border">
                            <pre className="text-sm whitespace-pre-wrap break-words font-mono text-red-900 dark:text-red-100">
                              {formatValue(change.before)}
                            </pre>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 mb-2">
                            <Plus className="h-3 w-3 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-medium text-foreground">
                              After
                            </span>
                          </div>
                          <div className="bg-green-500/5 dark:bg-green-500/10 border-green-500/20 dark:border-green-500/30 rounded-md p-2 border">
                            <pre className="text-sm whitespace-pre-wrap break-words font-mono text-green-900 dark:text-green-100">
                              {formatValue(change.after)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}


function compareObjects(before, after, resource, action) {
  const result = {
    added: {},
    removed: {},
    modified: {},
  };


  const allKeys = new Set([
    ...Object.keys(before || {}),
    ...Object.keys(after || {}),
  ]);

  for (const key of allKeys) {
    const beforeValue = before?.[key];
    const afterValue = after?.[key];


    if (isSensitiveField(key)) {
      continue;
    }

    if (beforeValue === undefined && afterValue !== undefined) {

      result.added[key] = afterValue;
    } else if (beforeValue !== undefined && afterValue === undefined) {

      result.removed[key] = beforeValue;
    } else if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {

      result.modified[key] = {
        before: beforeValue,
        after: afterValue,
        fieldType: getFieldType(key, resource),
        isImportant: isImportantField(key, resource, action),
      };
    }
  }

  return result;
}


function isSensitiveField(field) {
  const sensitiveFields = [
    "password",
    "inviteToken",
    "lastModifiedBy",
    "createdBy",
    "__v",
    "_id",
  ];
  return sensitiveFields.includes(field);
}


function getFieldType(field, resource) {
  const fieldTypes = {

    name: "text",
    email: "email",
    role: "role",
    status: "status",
    permissions: "array",
    organizationId: "reference",


    organizationName: "text",
    businessType: "select",


    createdAt: "date",
    updatedAt: "date",
    lastLogin: "date",
  };

  return fieldTypes[field] || "text";
}


function isImportantField(field, resource, action) {
  const importantFields = {
    User: ["name", "email", "role", "status", "permissions"],
    Organization: ["name", "businessType", "owner"],
    default: ["name", "email", "role", "status"],
  };

  const fields = importantFields[resource] || importantFields.default;
  return fields.includes(field);
}


function formatValue(value) {
  if (value === null) return "null";
  if (value === undefined) return "undefined";


  if (typeof value === "string" && isISODateString(value)) {
    try {
      const date = parseISO(value);
      if (isValid(date)) {
        return format(date, "MMM d, yyyy 'at' h:mm a");
      }
    } catch {

    }
  }


  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : "[]";
  }


  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}


function isISODateString(str) {

  const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
  return isoRegex.test(str);
}
