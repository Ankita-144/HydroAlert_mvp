import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { StatCard } from '@/components/StatCard';
import { WaterSourceCard } from '@/components/WaterSourceCard';
import { RecentTestsTable } from '@/components/RecentTestsTable';
import { AlertBanner } from '@/components/AlertBanner';
import { useWaterData } from '@/contexts/WaterDataContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Droplets,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Activity,
  TrendingUp,
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { waterSources, waterTests, dashboardStats } = useWaterData();
  const [showAlert, setShowAlert] = useState(true);

  const unsafeSource = waterSources.find(s => s.status === 'unsafe');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's the latest water quality status across campus
          </p>
        </div>

        {/* Alert Banner */}
        {showAlert && unsafeSource && (
          <div className="mb-6">
            <AlertBanner
              sourceName={unsafeSource.name}
              message="High chlorine levels detected. Avoid consumption until resolved."
              onDismiss={() => setShowAlert(false)}
            />
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Sources"
            value={dashboardStats.totalSources}
            icon={Droplets}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Safe"
            value={dashboardStats.safeSources}
            icon={CheckCircle}
            variant="safe"
          />
          <StatCard
            title="Borderline"
            value={dashboardStats.borderlineSources}
            icon={AlertTriangle}
            variant="borderline"
          />
          <StatCard
            title="Unsafe"
            value={dashboardStats.unsafeSources}
            icon={XCircle}
            variant="unsafe"
          />
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="col-span-2 lg:col-span-1 bg-card rounded-xl border p-5 shadow-soft">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tests Today</p>
                <p className="text-2xl font-bold">{dashboardStats.testsToday}</p>
              </div>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full w-3/4 transition-all" />
            </div>
          </div>
          <div className="bg-card rounded-xl border p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">{dashboardStats.testsThisWeek}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-status-unsafe/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-status-unsafe" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold">{dashboardStats.activeAlerts}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Water Sources */}
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold font-display text-lg">Water Sources</h2>
              <span className="text-sm text-muted-foreground">{waterSources.length} locations</span>
            </div>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {waterSources
                .sort((a, b) => {
                  const order = { unsafe: 0, borderline: 1, safe: 2 };
                  return order[a.status] - order[b.status];
                })
                .map((source) => (
                  <WaterSourceCard key={source.id} source={source} />
                ))}
            </div>
          </div>

          {/* Recent Tests */}
          <div className="lg:col-span-2">
            <RecentTestsTable tests={waterTests} />
          </div>
        </div>
      </main>
    </div>
  );
}
