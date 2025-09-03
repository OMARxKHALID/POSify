/**
 * User Model
 * ----------
 * - Represents system users
 * - Roles:
 *    - super_admin → global scope, no organizationId
 *    - admin → owner of exactly ONE Organization
 *    - staff → belongs to an Organization
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { USER_ROLES, USER_STATUSES, SALT_ROUNDS } from "@/constants";
import { baseSchemaOptions } from "@/schemas/base-schema.js";

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true }, // user name
    email: { type: String, required: true, trim: true, lowercase: true }, // unique email
    password: { type: String, required: true }, // hashed password

    phone: { type: String, trim: true, default: "" },
    profileImage: { type: String, trim: true, default: "" },

    role: {
      type: String,
      enum: USER_ROLES,
      required: true,
      default: "pending", // default until accepted
    },

    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: function () {
        return this.role === "admin" || this.role === "staff"; // org required only for admin/staff
      },
    },

    status: { type: String, enum: USER_STATUSES, default: "active" }, // active by default
    permissions: { type: [String], default: [] }, // dynamic permissions
    permissionsUpdatedAt: { type: Date, default: Date.now }, // last perms update

    lastLogin: { type: Date, default: null }, // login tracking

    emailVerified: { type: Boolean, default: false }, // email confirmation
    inviteToken: { type: String, trim: true }, // invite link
    inviteAcceptedAt: { type: Date }, // when invite accepted

    createdBy: { type: Schema.Types.ObjectId, ref: "User" }, // who created user
    lastModifiedBy: { type: Schema.Types.ObjectId, ref: "User" }, // who updated user
  },
  baseSchemaOptions
);

// Pre-save: hash password + update perms timestamp
UserSchema.pre("save", async function (next) {
  if (
    this.isModified("password") &&
    this.password &&
    !this.password.startsWith("$2")
  ) {
    this.password = await bcrypt.hash(this.password, SALT_ROUNDS); // hash new password
  }
  if (this.isModified("permissions")) {
    this.permissionsUpdatedAt = new Date(); // update perms timestamp
  }
  next();
});

// Methods
UserSchema.methods.hasPermission = function (permission) {
  return this.permissions.includes(permission); // check permission
};
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password); // compare hashed
};

// Remove sensitive fields when serializing
function transform(doc, ret) {
  delete ret.password;
  delete ret.inviteToken;
  return ret;
}

UserSchema.set("toJSON", { virtuals: true, transform });
UserSchema.set("toObject", { virtuals: true, transform });

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
