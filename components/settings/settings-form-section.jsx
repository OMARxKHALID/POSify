/**
 * Settings Form Section Component
 * Reusable component for settings form sections
 */

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { FormField } from "@/components/form/form-field";

export function SettingsFormSection({
  title,
  description,
  icon: Icon,
  children,
  className = "",
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5" />}
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-6">{children}</CardContent>
    </Card>
  );
}

export function SettingsFormGrid({ children, className = "" }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
      {children}
    </div>
  );
}

export function SettingsFormField({ control, name, label, ...props }) {
  return <FormField control={control} name={name} label={label} {...props} />;
}

