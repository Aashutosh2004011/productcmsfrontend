// Input types for API operations
export interface CreateUserInput {
  name: string;
  email: string;
  age?: number;
  password?: string;
  role?: 'user' | 'admin' | 'super-admin';
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  age?: number;
  password?: string;
  role?: 'user' | 'admin' | 'super-admin';
  isActive?: boolean;
}

// Auth-specific inputs
export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  age?: number;
  role?: 'user' | 'admin' | 'super-admin';
}import { Document } from 'mongoose';

// Base User interface
export interface IUser {
  name: string;
  email: string;
  age?: number;
  password?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

// User document interface (includes MongoDB document methods)
export interface IUserDocument extends IUser, Document {
  _id: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
  updateLastLogin(): Promise<IUserDocument>;
}

// Input types for API operations
export interface CreateUserInput {
  name: string;
  email: string;
  age?: number;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  age?: number;
}

// Serializable user type for client components (no Date objects)
export interface SerializableUser {
  _id: string;
  name: string;
  email: string;
  age?: number;
  createdAt: string;
  updatedAt?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// JWT Payload
export interface JWTPayload {
  id: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

// Auth Response
export interface AuthResponse {
  success: boolean;
  data?: {
    user: SerializableUser;
    token?: string;
  };
  error?: string;
  message?: string;
}

// Server Action Response type
export interface ActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}