import mongoose, { Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUserDocument } from '../types/user';

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      maxlength: [50, 'Name cannot be more than 50 characters'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    age: {
      type: Number,
      min: [0, 'Age must be a positive number'],
      max: [150, 'Age must be realistic'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't include password in queries by default
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true, // This adds createdAt and updatedAt automatically
  }
);

// Create indexes for better performance
UserSchema.index({ isActive: 1 });
UserSchema.index({ createdAt: -1 });

// Hash password before saving
UserSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new) and exists
  if (!this.isModified('password') || !this.password) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance method to check password
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to update last login
UserSchema.methods.updateLastLogin = async function (): Promise<IUserDocument> {
  this.lastLogin = new Date();
  return this.save();
};

// Static method to find by email with password
UserSchema.statics.findByEmailWithPassword = function (email: string) {
  return this.findOne({ email, isActive: true }).select('+password');
};

// Add any instance methods if needed
UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password; // Never send password to client
  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    age: user.age,
    isActive: user.isActive,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

// Prevent re-compilation during development
const User: Model<IUserDocument> = 
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);

export default User;