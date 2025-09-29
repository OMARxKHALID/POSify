import { useCallback } from "react";

const DEFAULT_CONFIG = {
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
};

// Check Cloudinary configuration (non-blocking)
const checkConfig = (config) => {
  const missing = [];
  if (!config.cloudName) missing.push("cloudName");
  if (!config.uploadPreset) missing.push("uploadPreset");

  return {
    isValid: missing.length === 0,
    missing,
    error:
      missing.length > 0
        ? `Missing Cloudinary configuration: ${missing.join(
            ", "
          )}. Please check your environment variables.`
        : null,
  };
};

export const useCloudinary = (config = {}) => {
  const {
    uploadPreset = DEFAULT_CONFIG.uploadPreset,
    cloudName = DEFAULT_CONFIG.cloudName,
  } = config;

  // Check configuration (non-blocking)
  const configCheck = checkConfig({ cloudName, uploadPreset });

  // Cloudinary upload
  const uploadToCloudinary = useCallback(
    async (file) => {
      // Check if configuration is valid
      if (!cloudName || !uploadPreset) {
        throw new Error(
          "Cloudinary is not configured. Please check your environment variables."
        );
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", "POS_SAAS/images");

      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage =
            errorData.error?.message ||
            `Upload failed with status ${response.status}`;

          // Handle specific Cloudinary errors
          if (errorMessage.includes("cloud_name is disabled")) {
            throw new Error(
              "Cloudinary cloud name is disabled. Please check your Cloudinary account settings."
            );
          }

          throw new Error(errorMessage);
        }

        const data = await response.json();
        return data.secure_url;
      } catch (error) {
        throw new Error(error.message || "Failed to upload image");
      }
    },
    [cloudName, uploadPreset]
  );

  return {
    uploadToCloudinary,
    config: { uploadPreset, cloudName },
    isConfigured: configCheck.isValid,
    configError: configCheck.error,
  };
};
