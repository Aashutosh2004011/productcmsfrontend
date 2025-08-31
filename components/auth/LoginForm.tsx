// app/components/auth/LoginForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn, Loader2, Shield } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/app/contexts/AuthContext';

// Zod schema for validation
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setSubmitError(null);

    try {
      const result = await login(data.email, data.password);

      if (result.success) {
        // Clear form on successful login
        reset();
        
        // Redirect to admin dashboard
        router.push('/admin/dashboard');
        router.refresh();
      } else {
        setSubmitError(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setSubmitError('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-3">
            Welcome Back
          </h1>
          <p className="text-slate-400 text-lg">
            Sign in to access your admin dashboard
          </p>
        </div>

        {/* Login Form Card */}
        <Card className="shadow-2xl border-slate-800 bg-slate-900/50 backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-8">
            <CardTitle className="text-2xl font-bold text-center text-white">
              Sign In
            </CardTitle>
            <CardDescription className="text-center text-slate-400">
              Enter your credentials to continue
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200 font-medium">
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
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-sm text-red-400 mt-1">
                    {errors.email.message}
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
                    placeholder="Enter your password"
                    {...register('password')}
                    className={`
                      bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 pr-10
                      focus:border-blue-500 focus:ring-blue-500 transition-all duration-200
                      ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                    `}
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-400 hover:text-slate-300"
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-400 mt-1">
                    {errors.password.message}
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

              {/* Forgot Password Link */}
              <div className="text-right">
                <Button 
                  type="button" 
                  variant="link" 
                  className="text-blue-400 hover:text-blue-300 p-0 h-auto"
                  disabled={isSubmitting}
                >
                  Forgot your password?
                </Button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-slate-400">
                Don't have an account?{' '}
                <Button
                  type="button"
                  variant="link"
                  onClick={() => router.push('/auth/register')}
                  className="text-blue-400 hover:text-blue-300 p-0 h-auto font-medium"
                  disabled={isSubmitting}
                >
                  Sign up here
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-8 text-center text-slate-500 text-sm">
          <p>Protected by enterprise-grade security</p>
        </div>
      </div>
    </div>
  );
}