// app/components/auth/RegisterForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, UserPlus, Loader2, Shield, User, Mail, Calendar } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Zod schema for registration validation
const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot be more than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  age: z
    .number({
      required_error: 'Age is required',
      invalid_type_error: 'Age must be a valid number',
    })
    .min(13, 'You must be at least 13 years old')
    .max(150, 'Please enter a realistic age')
    .optional()
    .or(z.literal('')),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      age: undefined,
      password: '',
      confirmPassword: '',
    },
  });

  // Watch password for real-time validation feedback
  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setSubmitError(null);
    setIsRegistering(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          age: data.age || undefined,
        }),
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        // Clear form on successful registration
        reset();
        
        // Redirect to admin dashboard
        router.push('/admin/dashboard');
        router.refresh();
      } else {
        setSubmitError(result.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setSubmitError('Network error. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password || '');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-4 py-8">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 via-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-3">
            Create Account
          </h1>
          <p className="text-slate-400 text-lg">
            Join our admin platform today
          </p>
        </div>

        {/* Registration Form Card */}
        <Card className="shadow-2xl border-slate-800 bg-slate-900/50 backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center text-white">
              Sign Up
            </CardTitle>
            <CardDescription className="text-center text-slate-400">
              Create your admin account to get started
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-200 font-medium flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  {...register('name')}
                  className={`
                    bg-slate-800 border-slate-700 text-white placeholder:text-slate-400
                    focus:border-blue-500 focus:ring-blue-500 transition-all duration-200
                    ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                  `}
                  disabled={isSubmitting || isRegistering}
                />
                {errors.name && (
                  <p className="text-sm text-red-400 mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200 font-medium flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...register('email')}
                  className={`
                    bg-slate-800 border-slate-700 text-white placeholder:text-slate-400
                    focus:border-blue-500 focus:ring-blue-500 transition-all duration-200
                    ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                  `}
                  disabled={isSubmitting || isRegistering}
                />
                {errors.email && (
                  <p className="text-sm text-red-400 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Age Field */}
              <div className="space-y-2">
                <Label htmlFor="age" className="text-slate-200 font-medium flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Age (Optional)
                </Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter your age"
                  {...register('age', { valueAsNumber: true })}
                  className={`
                    bg-slate-800 border-slate-700 text-white placeholder:text-slate-400
                    focus:border-blue-500 focus:ring-blue-500 transition-all duration-200
                    ${errors.age ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                  `}
                  disabled={isSubmitting || isRegistering}
                />
                {errors.age && (
                  <p className="text-sm text-red-400 mt-1">
                    {errors.age.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    {...register('password')}
                    className={`
                      bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 pr-10
                      focus:border-blue-500 focus:ring-blue-500 transition-all duration-200
                      ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                    `}
                    disabled={isSubmitting || isRegistering}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-400 hover:text-slate-300"
                    disabled={isSubmitting || isRegistering}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {/* Password Strength Indicator */}
                {password && password.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex space-x-1">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
                            i < passwordStrength
                              ? passwordStrength <= 2
                                ? 'bg-red-500'
                                : passwordStrength <= 3
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                              : 'bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs ${
                      passwordStrength <= 2 ? 'text-red-400' : 
                      passwordStrength <= 3 ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      Password strength: {
                        passwordStrength <= 2 ? 'Weak' : 
                        passwordStrength <= 3 ? 'Medium' : 'Strong'
                      }
                    </p>
                  </div>
                )}

                {errors.password && (
                  <p className="text-sm text-red-400 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-200 font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    {...register('confirmPassword')}
                    className={`
                      bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 pr-10
                      focus:border-blue-500 focus:ring-blue-500 transition-all duration-200
                      ${errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                    `}
                    disabled={isSubmitting || isRegistering}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-400 hover:text-slate-300"
                    disabled={isSubmitting || isRegistering}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-400 mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Submit Error */}
              {submitError && (
                <Alert variant="destructive" className="border-red-500 bg-red-500/10">
                  <AlertDescription className="text-red-400">
                    {submitError}
                  </AlertDescription>
                </Alert>
              )}

              {/* Terms and Conditions */}
              <div className="text-sm text-slate-400 bg-slate-800/50 rounded-lg p-3">
                <p>
                  By creating an account, you agree to our{' '}
                  <Button variant="link" className="text-blue-400 hover:text-blue-300 p-0 h-auto text-sm">
                    Terms of Service
                  </Button>
                  {' '}and{' '}
                  <Button variant="link" className="text-blue-400 hover:text-blue-300 p-0 h-auto text-sm">
                    Privacy Policy
                  </Button>
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting || isRegistering}
                className="w-full h-12 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 hover:from-green-700 hover:via-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                size="lg"
              >
                {isSubmitting || isRegistering ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    Create Account
                  </>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-slate-400">
                Already have an account?{' '}
                <Button
                  type="button"
                  variant="link"
                  onClick={() => router.push('/auth/login')}
                  className="text-blue-400 hover:text-blue-300 p-0 h-auto font-medium"
                  disabled={isSubmitting || isRegistering}
                >
                  Sign in here
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-6 text-center text-slate-500 text-sm">
          <p>Join thousands of administrators worldwide</p>
        </div>
      </div>
    </div>
  );
}