import React from 'react';
import { Header } from '@/components/Header';
import { WaterTestUpload } from '@/components/WaterTestUpload';
import { useAuth } from '@/contexts/AuthContext';
import { AlertTriangle } from 'lucide-react';

export default function Upload() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold font-display">Upload Water Test</h1>
            <p className="text-muted-foreground mt-2">
              Analyze a water test strip using AI-powered image recognition
            </p>
          </div>

          {user?.role === 'student' && (
            <div className="mb-8 p-4 rounded-xl bg-status-borderline-bg border border-status-borderline/20 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-status-borderline flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Student Access</p>
                <p className="text-sm text-muted-foreground">
                  You can view test results but official submissions are limited to staff members.
                </p>
              </div>
            </div>
          )}

          <WaterTestUpload />
        </div>
      </main>
    </div>
  );
}
