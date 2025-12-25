import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import {
  Droplets,
  Shield,
  Zap,
  MapPin,
  BarChart3,
  Upload,
  ArrowRight,
  CheckCircle,
  Users,
  Clock,
  Smartphone,
} from 'lucide-react';

const features = [
  {
    icon: Upload,
    title: 'Smart Strip Analysis',
    description: 'Upload water test strip photos and get instant AI-powered analysis with 95%+ accuracy.',
  },
  {
    icon: MapPin,
    title: 'Campus-Wide Mapping',
    description: 'Interactive map showing all water sources with real-time status indicators.',
  },
  {
    icon: Zap,
    title: 'Instant Alerts',
    description: 'Get notified immediately when unsafe water conditions are detected.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Track trends, view history, and monitor campus water quality over time.',
  },
];

const stats = [
  { value: '8+', label: 'Water Sources' },
  { value: '98%', label: 'Accuracy Rate' },
  { value: '< 3min', label: 'Analysis Time' },
  { value: '24/7', label: 'Monitoring' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 pt-20 pb-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in">
              <Shield className="h-4 w-4" />
              AI-Powered Campus Water Safety
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold font-display tracking-tight mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Clean Water,{' '}
              <span className="text-gradient">Safer Campus</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              HydroAlert uses AI to analyze water test strips instantly, 
              providing real-time water quality monitoring across your entire campus.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <Button size="xl" variant="hero" asChild>
                <Link to="/login?mode=signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" asChild>
                <Link to="/login">
                  Sign In
                </Link>
              </Button>
            </div>

            {/* Demo credentials */}
            <p className="text-sm text-muted-foreground mt-6 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              Demo: <code className="px-2 py-0.5 bg-muted rounded text-xs">student@campus.edu</code> / <code className="px-2 py-0.5 bg-muted rounded text-xs">demo123</code>
            </p>
          </div>
        </div>

        {/* Hero Image/Preview */}
        <div className="container mx-auto px-4 -mt-16">
          <div className="relative max-w-5xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-floating border bg-card animate-scale-in" style={{ animationDelay: '0.4s' }}>
              <div className="aspect-video bg-gradient-to-br from-primary/5 to-primary/10 p-8 flex items-center justify-center">
                {/* Mock Dashboard Preview */}
                <div className="w-full h-full bg-card rounded-xl border shadow-soft p-6 grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-1 p-4 rounded-lg bg-status-safe-bg border border-status-safe/20">
                        <div className="text-2xl font-bold text-status-safe">5</div>
                        <div className="text-sm text-muted-foreground">Safe Sources</div>
                      </div>
                      <div className="flex-1 p-4 rounded-lg bg-status-borderline-bg border border-status-borderline/20">
                        <div className="text-2xl font-bold text-status-borderline">2</div>
                        <div className="text-sm text-muted-foreground">Borderline</div>
                      </div>
                      <div className="flex-1 p-4 rounded-lg bg-status-unsafe-bg border border-status-unsafe/20">
                        <div className="text-2xl font-bold text-status-unsafe">1</div>
                        <div className="text-sm text-muted-foreground">Unsafe</div>
                      </div>
                    </div>
                    <div className="h-32 bg-muted/50 rounded-lg flex items-center justify-center text-muted-foreground">
                      <BarChart3 className="h-8 w-8 opacity-50" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg bg-muted/50 flex items-center gap-3">
                      <StatusBadge status="safe" size="sm" showIcon={false} />
                      <span className="text-sm truncate">Library Fountain</span>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 flex items-center gap-3">
                      <StatusBadge status="borderline" size="sm" showIcon={false} />
                      <span className="text-sm truncate">Cafeteria Main</span>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 flex items-center gap-3">
                      <StatusBadge status="unsafe" size="sm" showIcon={false} />
                      <span className="text-sm truncate">Dormitory Hall A</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -left-4 top-1/4 bg-card rounded-xl shadow-floating border p-4 animate-float hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-status-safe flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-sm">Water Safe</p>
                  <p className="text-xs text-muted-foreground">Library • Just now</p>
                </div>
              </div>
            </div>
            
            <div className="absolute -right-4 bottom-1/4 bg-card rounded-xl shadow-floating border p-4 animate-float hidden lg:block" style={{ animationDelay: '1s' }}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">New Test</p>
                  <p className="text-xs text-muted-foreground">Analyzing...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl md:text-5xl font-bold font-display text-primary">{stat.value}</p>
                <p className="text-muted-foreground mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
              Everything you need for water safety
            </h2>
            <p className="text-muted-foreground text-lg">
              A complete solution for monitoring and maintaining water quality across campus
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="group p-6 rounded-2xl border bg-card hover:shadow-elevated hover:border-primary/30 transition-all duration-300"
                >
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
              Test in under 3 minutes
            </h2>
            <p className="text-muted-foreground text-lg">
              Simple, fast, and accurate water quality testing
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '1', title: 'Dip Test Strip', description: 'Use a standard water test strip at any campus water source' },
              { step: '2', title: 'Snap Photo', description: 'Take a photo of the test strip with your phone' },
              { step: '3', title: 'Get Results', description: 'AI analyzes colors and provides instant classification' },
            ].map((item, i) => (
              <div key={i} className="relative text-center">
                <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
                {i < 2 && (
                  <ArrowRight className="hidden md:block absolute top-8 -right-4 h-6 w-6 text-muted-foreground/50" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-12 text-center text-primary-foreground">
            <Droplets className="h-16 w-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
              Ready to ensure safe water for your campus?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
              Join institutions using HydroAlert to protect students and staff with real-time water quality monitoring.
            </p>
            <Button size="xl" variant="secondary" asChild>
              <Link to="/login?mode=signup">
                Start Monitoring Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Droplets className="h-6 w-6 text-primary" />
              <span className="font-display font-bold">HydroAlert</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 HydroAlert. AI-Powered Campus Water Safety.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
