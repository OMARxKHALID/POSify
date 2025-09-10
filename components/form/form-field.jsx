"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormField as ReactHookFormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function FormField({
  control,
  name,
  label,
  icon: Icon,
  type = "text",
  placeholder,
  disabled = false,
  options = null, // For select fields
  iconPosition = "label", // "label" or "input"
  className = "",
  render,
  ...props
}) {
  const renderInput = (field) => {
    if (options) {
      return (
        <Select
          onValueChange={field.onChange}
          value={field.value}
          disabled={disabled}
        >
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (iconPosition === "input" && Icon) {
      return (
        <div className="relative">
          <Icon className="absolute w-4 h-4 text-muted-foreground transform -translate-y-1/2 left-3 top-1/2" />
          <Input
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            className={`pl-10 ${className}`}
            {...field}
            {...props}
          />
        </div>
      );
    }

    return (
      <Input
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
        {...field}
        {...props}
      />
    );
  };

  return (
    <ReactHookFormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel
            className={
              iconPosition === "label"
                ? "flex items-center gap-2"
                : "text-sm font-medium text-foreground"
            }
          >
            {iconPosition === "label" && Icon && <Icon className="h-4 w-4" />}
            {label}
          </FormLabel>
          <FormControl>{renderInput(field)}</FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
