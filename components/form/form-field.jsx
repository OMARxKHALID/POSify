"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/ui/image-upload";
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
  component = "input", // "input", "textarea", "switch", "select", "image"
  switchDescription = "", // Description for switch components
  ...props
}) {
  const renderInput = (field) => {
    // Handle custom render function
    if (render) {
      return render(field);
    }

    // Handle select component
    if (component === "select" || options) {
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
            {options?.map((option, index) => (
              <SelectItem key={`${option.value}-${index}`} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // Handle switch component
    if (component === "switch") {
      return (
        <Switch
          checked={field.value}
          onCheckedChange={field.onChange}
          disabled={disabled}
        />
      );
    }

    // Handle textarea component
    if (component === "textarea") {
      return (
        <Textarea
          placeholder={placeholder}
          disabled={disabled}
          className={className}
          {...field}
          {...props}
        />
      );
    }

    // Handle image upload component
    if (component === "image") {
      return (
        <ImageUpload
          value={field.value}
          onChange={field.onChange}
          disabled={disabled}
          className={className}
          placeholder={placeholder}
          {...props}
        />
      );
    }

    // Handle input with icon inside
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

    // Default input component
    return (
      <Input
        type={type === "number" ? "text" : type}
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
        <FormItem
          className={
            component === "switch"
              ? "flex flex-row items-center justify-between rounded-lg border p-4"
              : ""
          }
        >
          {component === "switch" ? (
            <div className="space-y-0.5">
              <FormLabel className="text-base flex items-center gap-2">
                {Icon && <Icon className="h-4 w-4" />}
                {label}
              </FormLabel>
              {switchDescription && (
                <div className="text-sm text-muted-foreground">
                  {switchDescription}
                </div>
              )}
            </div>
          ) : (
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
          )}
          <FormControl>{renderInput(field)}</FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
