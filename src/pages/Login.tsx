import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Droplets, Loader2, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = loginSchema.extend({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['student', 'staff']),
});

export default function Login() {
  const [searchParams] = useSearchParams();
  const [isSignup, setIsSignup] = useState(searchParams.get('mode') === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'staff'>('student');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      if (isSignup) {
        const result = signupSchema.safeParse({ email, password, name, role });
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setIsSubmitting(false);
          return;
        }
        await signup(email, password, name, role);
        toast({
          title: 'Account created!',
          description: 'Welcome to HydroAlert.',
        });
      } else {
        const result = loginSchema.safeParse({ email, password });
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setIsSubmitting(false);
          return;
        }
        await login(email, password);
        toast({
          title: 'Welcome back!',
          description: 'Successfully signed in.',
        });
      }
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 py-12 lg:px-16">
        <div className="w-full max-w-md mx-auto">
          {/* Back Link */}
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <Droplets className="h-8 w-8 text-primary" />
            <span className="font-display font-bold text-xl">HydroAlert</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold font-display">
              {isSignup ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isSignup
                ? 'Start monitoring water quality on campus'
                : 'Sign in to access your dashboard'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@campus.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            {isSignup && (
              <div className="space-y-2">
                <Label>I am a</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      role === 'student'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <span className="font-medium">Student</span>
                    <p className="text-xs text-muted-foreground mt-1">View water status</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('staff')}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      role === 'staff'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <span className="font-medium">Staff</span>
                    <p className="text-xs text-muted-foreground mt-1">Upload test results</p>
                  </button>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isSignup ? 'Creating account...' : 'Signing in...'}
                </>
              ) : (
                isSignup ? 'Create Account' : 'Sign In'
              )}
            </Button>
          </form>

          {/* Toggle */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="text-primary font-medium hover:underline"
            >
              {isSignup ? 'Sign in' : 'Create one'}
            </button>
          </p>

          {/* Demo credentials */}
          {!isSignup && (
            <div className="mt-8 p-4 rounded-xl bg-muted/50 border">
              <p className="text-sm font-medium mb-2">Demo Credentials</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Student: <code className="px-1 py-0.5 bg-background rounded text-xs">student@campus.edu</code></p>
                <p>Staff: <code className="px-1 py-0.5 bg-background rounded text-xs">staff@campus.edu</code></p>
                <p>Password: <code className="px-1 py-0.5 bg-background rounded text-xs">demo123</code></p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Visual */}
      <div className="hidden lg:flex flex-1 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
        <div className="flex flex-col justify-center items-center p-12 text-primary-foreground z-10">
          <Droplets className="h-24 w-24 mb-8 opacity-90" />
          <h2 className="text-4xl font-bold font-display text-center mb-4">
            Protect Your Campus
          </h2>
          <p className="text-xl text-primary-foreground/80 text-center max-w-md">
            Real-time water quality monitoring powered by AI technology
          </p>
          <div className="mt-12 grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold">8+</p>
              <p className="text-sm opacity-80">Water Sources</p>
            </div>
            <div>
              <p className="text-3xl font-bold">98%</p>
              <p className="text-sm opacity-80">Accuracy</p>
            </div>
            <div>
              <p className="text-3xl font-bold">24/7</p>
              <p className="text-sm opacity-80">Monitoring</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
