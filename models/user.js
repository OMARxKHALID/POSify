import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { USER_ROLES, USER_STATUSES, SALT_ROUNDS } from "@/constants";
import { baseSchemaOptions } from "./utils/base-schema";

const { Schema } = mongoose;

/**
 * User Schema
 * Represents users within an organization ( admin, staff)
 */
const UserSchema = new Schema(
  {
    // Required fields
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: USER_ROLES, // admin | staff
      required: true,
    },

    // Optional fields
    status: {
      type: String,
      enum: USER_STATUSES,
      default: "invited",
    },
    permissions: {
      type: [String],
      default: [],
    },
    permissionsUpdatedAt: {
      type: Date,
      default: Date.now,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    profileImage: {
      type: String,
      trim: true,
      default: "",
    },
    lastLogin: {
      type: Date,
      default: null,
    },

    // Email verification & invitation
    emailVerified: {
      type: Boolean,
      default: false,
    },
    inviteToken: {
      type: String,
      trim: true,
    },
    inviteAcceptedAt: {
      type: Date,
    },

    // Audit fields
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    lastModifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  baseSchemaOptions
);

// ============================================================================
// INDEXES
// ============================================================================

UserSchema.index({ userId: 1, email: 1 }, { unique: true });
UserSchema.index({ userId: 1, role: 1 });
UserSchema.index({ status: 1 });

// ============================================================================
// MIDDLEWARE
// ============================================================================

/**
 * Pre-save middleware: Hash password and update permissions timestamp
 */
UserSchema.pre("save", async function (next) {
  // Hash password if modified and not already hashed
  if (this.isModified("password")) {
    if (this.password && !this.password.startsWith("$2")) {
      this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
    }
  }

  // Update permissions timestamp if permissions changed
  if (this.isModified("permissions")) {
    this.permissionsUpdatedAt = new Date();
  }

  next();
});

// ============================================================================
// INSTANCE METHODS
// ============================================================================

/**
 * Check if user has a specific permission
 * @param {string} permission - Permission to check
 * @returns {boolean} - True if user has permission
 */
UserSchema.methods.hasPermission = function (permission) {
  return this.permissions.includes(permission);
};

/**
 * Compare password with candidate password
 * @param {string} candidatePassword - Password to compare
 * @returns {Promise<boolean>} - True if passwords match
 */
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ============================================================================
// TRANSFORM & SERIALIZATION
// ============================================================================

/**
 * Transform document for JSON serialization
 * Removes sensitive fields from output
 */
function transform(doc, ret) {
  delete ret.password;
  delete ret.inviteToken;
  return ret;
}

UserSchema.set("toJSON", { virtuals: true, transform });
UserSchema.set("toObject", { virtuals: true, transform });

// ============================================================================
// EXPORT
// ============================================================================

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
