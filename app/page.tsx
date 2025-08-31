// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  LogIn, 
  UserPlus, 
  ArrowRight, 
  CheckCircle, 
  Users, 
  BarChart3, 
  Settings,
  Loader2,
  Globe
} from 'lucide-react';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Check authentication status on page load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.user) {
            setIsAuthenticated(true);
            // Optional: Auto-redirect to dashboard if already logged in
            // router.push('/admin/dashboard');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/admin/dashboard');
    } else {
      router.push('/auth/login');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-900/30 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin CMS</h1>
                <p className="text-xs text-slate-400">Products Management System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="border-green-500 text-green-400">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Authenticated
                  </Badge>
                  <Button 
                    onClick={() => router.push('/admin/dashboard')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Dashboard
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/auth/login')}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                  <Button 
                    onClick={() => router.push('/auth/register')}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl">
            <Shield className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-6">
            Products CMS
          </h1>
          
          <p className="text-xl text-slate-300 mb-2 max-w-2xl mx-auto leading-relaxed">
            Powerful admin dashboard for managing your products, users, and business operations
          </p>
          
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            Built with Next.js, MongoDB, and modern authentication
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={handleGetStarted}
              size="lg"
              className="h-14 px-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isAuthenticated ? (
                <>
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Go to Dashboard
                </>
              ) : (
                <>
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Get Started
                </>
              )}
            </Button>
            
            {!isAuthenticated && (
              <Button 
                variant="outline"
                size="lg"
                onClick={() => router.push('/auth/register')}
                className="h-14 px-8 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Create Account
              </Button>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800 hover:border-slate-700 transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white">User Management</CardTitle>
              <CardDescription>
                Complete user administration with roles, permissions, and activity tracking
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800 hover:border-slate-700 transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white">Analytics Dashboard</CardTitle>
              <CardDescription>
                Real-time insights and reporting with interactive charts and metrics
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800 hover:border-slate-700 transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white">System Control</CardTitle>
              <CardDescription>
                Advanced configuration options and system administration tools
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Status Section */}
        <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">System Status</h2>
            <p className="text-slate-400">Current platform health and statistics</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">99.9%</div>
              <div className="text-slate-400 text-sm">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">1,234</div>
              <div className="text-slate-400 text-sm">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">5,678</div>
              <div className="text-slate-400 text-sm">Products Managed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400 mb-2">24/7</div>
              <div className="text-slate-400 text-sm">Support</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        {!isAuthenticated && (
          <div className="text-center bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 border border-blue-500/20 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
              Join our platform today and take control of your product management with our powerful admin tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => router.push('/auth/register')}
                size="lg"
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Create Account
              </Button>
              <Button 
                variant="outline"
                size="lg"
                onClick={() => router.push('/auth/login')}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Sign In
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 bg-slate-900/30 backdrop-blur-xl mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-white font-semibold">Products CMS</div>
                <div className="text-slate-400 text-sm">Admin Dashboard</div>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-slate-400 text-sm">
              <span>© 2025 Products CMS</span>
              <span className="flex items-center">
                <Globe className="w-4 h-4 mr-1" />
                Secure & Reliable
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}