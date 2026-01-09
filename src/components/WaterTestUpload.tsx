import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';
import { WaterStatus } from '@/types/water';
import { useWaterData } from '@/contexts/WaterDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  Camera,
  Image,
  Loader2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type UploadStep = 'select' | 'preview' | 'analyzing' | 'result';

interface AnalysisResult {
  status: WaterStatus;
  confidence: number;
  parameters: {
    ph: number;
    chlorine: number;
    turbidity: number;
    hardness: number;
  };
  recommendations: string[];
}

export function WaterTestUpload() {
  const [step, setStep] = useState<UploadStep>('select');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { addTestResult, waterSources } = useWaterData();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setStep('preview');
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setStep('preview');
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Determine water status based on chlorine levels
  // Safe: 0.2-0.5 mg/L (pink to violet strip color)
  // Borderline: 0.1-0.2 mg/L or 0.5-1.0 mg/L
  // Unsafe: <0.1 mg/L (too low, no disinfection) or >1.0 mg/L (too high)
  const determineStatus = (chlorine: number): WaterStatus => {
    if (chlorine >= 0.2 && chlorine <= 0.5) {
      return 'safe'; // Pink to violet color range
    } else if ((chlorine >= 0.1 && chlorine < 0.2) || (chlorine > 0.5 && chlorine <= 1.0)) {
      return 'borderline';
    } else {
      return 'unsafe';
    }
  };

  const getStripColorDescription = (chlorine: number): string => {
    if (chlorine >= 0.2 && chlorine <= 0.5) {
      return 'Pink to Violet (Safe Range)';
    } else if (chlorine < 0.2) {
      return 'Light Pink/Colorless (Low Chlorine)';
    } else if (chlorine <= 1.0) {
      return 'Dark Violet (Elevated Chlorine)';
    } else {
      return 'Deep Purple (High Chlorine)';
    }
  };

  const analyzeImage = async () => {
    setStep('analyzing');
    
    // Simulate AI analysis - detecting strip colors
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Simulate chlorine reading from strip color analysis
    // Random value weighted towards realistic test results
    const chlorineReading = Math.random() < 0.6 
      ? 0.2 + Math.random() * 0.3  // 60% chance of safe range (0.2-0.5)
      : Math.random() < 0.7 
        ? 0.1 + Math.random() * 0.1  // Lower borderline
        : 0.5 + Math.random() * 1.5; // Higher range (borderline to unsafe)
    
    const status = determineStatus(chlorineReading);
    const stripColor = getStripColorDescription(chlorineReading);
    
    const mockResult: AnalysisResult = {
      status,
      confidence: 85 + Math.random() * 14,
      parameters: {
        ph: status === 'safe' ? 6.8 + Math.random() * 0.4 : status === 'borderline' ? 7.2 + Math.random() * 0.6 : 7.8 + Math.random() * 0.7,
        chlorine: parseFloat(chlorineReading.toFixed(2)),
        turbidity: status === 'safe' ? 0.2 + Math.random() * 0.3 : status === 'borderline' ? 0.6 + Math.random() * 0.4 : 1.2 + Math.random() * 0.8,
        hardness: status === 'safe' ? 80 + Math.random() * 40 : status === 'borderline' ? 130 + Math.random() * 40 : 180 + Math.random() * 50,
      },
      recommendations: status === 'safe' 
        ? [
            `Strip color detected: ${stripColor}`,
            'Chlorine level is within optimal range (0.2-0.5 mg/L).',
            'Water is safe for consumption.',
            'Continue regular monitoring schedule.'
          ]
        : status === 'borderline'
        ? [
            `Strip color detected: ${stripColor}`,
            'Chlorine level is slightly outside optimal range.',
            'Monitor closely and retest within 24 hours.',
            'Check water treatment system if readings persist.'
          ]
        : [
            `Strip color detected: ${stripColor}`,
            chlorineReading < 0.1 ? 'Chlorine too low - insufficient disinfection.' : 'Chlorine too high - may cause irritation.',
            'Do not consume water from this source.',
            'Notify maintenance immediately.',
            'Post warning signage at water source.'
          ],
    };
    
    setAnalysisResult(mockResult);
    setStep('result');
    
    toast({
      title: status === 'safe' ? 'Water is Safe ✓' : status === 'borderline' ? 'Borderline Quality ⚠' : 'Unsafe Water Detected ✕',
      description: `Chlorine: ${chlorineReading.toFixed(2)} mg/L - ${stripColor}`,
      variant: status === 'unsafe' ? 'destructive' : 'default',
    });
  };

  const resetUpload = () => {
    setStep('select');
    setSelectedImage(null);
    setAnalysisResult(null);
    setSelectedSource('');
    setIsSaving(false);
  };

  const handleSaveResult = async () => {
    if (!analysisResult || !selectedSource) return;

    setIsSaving(true);
    
    // Simulate save delay
    await new Promise(resolve => setTimeout(resolve, 500));

    addTestResult(selectedSource, {
      status: analysisResult.status,
      phLevel: analysisResult.parameters.ph,
      chlorine: analysisResult.parameters.chlorine,
      turbidity: analysisResult.parameters.turbidity,
      hardness: analysisResult.parameters.hardness,
      testedBy: user?.name || 'Unknown User',
      notes: analysisResult.status === 'safe' 
        ? 'All parameters within normal range.'
        : analysisResult.status === 'borderline'
        ? 'Parameters slightly elevated. Monitoring recommended.'
        : 'Critical levels detected. Immediate action required.',
    });

    toast({
      title: 'Result Saved',
      description: 'The test result has been saved and dashboard updated.',
    });

    setIsSaving(false);
    navigate('/dashboard');
  };

  const getStatusIcon = (status: WaterStatus) => {
    switch (status) {
      case 'safe': return <CheckCircle className="h-12 w-12 text-status-safe" />;
      case 'borderline': return <AlertTriangle className="h-12 w-12 text-status-borderline" />;
      case 'unsafe': return <XCircle className="h-12 w-12 text-status-unsafe" />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {(['select', 'preview', 'analyzing', 'result'] as UploadStep[]).map((s, i) => (
          <React.Fragment key={s}>
            <div className={cn(
              'h-2.5 w-2.5 rounded-full transition-all',
              step === s ? 'bg-primary scale-125' : 
              (['select', 'preview', 'analyzing', 'result'].indexOf(step) > i) ? 'bg-primary/50' : 'bg-muted'
            )} />
            {i < 3 && <div className={cn(
              'h-0.5 w-8 transition-all',
              (['select', 'preview', 'analyzing', 'result'].indexOf(step) > i) ? 'bg-primary/50' : 'bg-muted'
            )} />}
          </React.Fragment>
        ))}
      </div>

      {/* Select Step */}
      {step === 'select' && (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center">
            <h2 className="text-2xl font-bold font-display">Upload Water Test Strip</h2>
            <p className="text-muted-foreground mt-2">
              Take a photo of your water test strip for AI analysis
            </p>
          </div>

          {/* Source Selection */}
          <div className="bg-card rounded-xl border p-4">
            <label className="block text-sm font-medium mb-2">Water Source</label>
            <select 
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">Select a water source...</option>
              {waterSources.map(source => (
                <option key={source.id} value={source.id}>{source.name}</option>
              ))}
            </select>
          </div>

          {/* Upload Area */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="relative border-2 border-dashed border-primary/30 rounded-xl p-12 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all cursor-pointer group"
          >
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <p className="font-medium">Drag and drop your image here</p>
              <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
            </div>
          </div>

          {/* Camera Option */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-sm text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <Button variant="outline" className="w-full h-14 text-base" onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}>
            <Camera className="h-5 w-5 mr-2" />
            Take Photo with Camera
          </Button>
        </div>
      )}

      {/* Preview Step */}
      {step === 'preview' && selectedImage && (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center">
            <h2 className="text-2xl font-bold font-display">Preview Image</h2>
            <p className="text-muted-foreground mt-2">
              Make sure the test strip is clearly visible
            </p>
          </div>

          <div className="relative rounded-xl overflow-hidden border shadow-soft">
            <img
              src={selectedImage}
              alt="Water test strip"
              className="w-full h-auto max-h-96 object-contain bg-muted"
            />
          </div>

          <div className="bg-accent/50 rounded-xl p-4">
            <h4 className="font-medium text-sm mb-2">Tips for best results:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Ensure the test strip is flat and well-lit</li>
              <li>• Wait the recommended time before photographing</li>
              <li>• Include the color reference chart if available</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={resetUpload} className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" />
              Retake
            </Button>
            <Button onClick={analyzeImage} className="flex-1" disabled={!selectedSource}>
              Analyze Strip
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Analyzing Step */}
      {step === 'analyzing' && (
        <div className="space-y-6 animate-fade-in text-center py-12">
          <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-display">Analyzing Test Strip</h2>
            <p className="text-muted-foreground mt-2">
              AI is processing the color values...
            </p>
          </div>
          <div className="max-w-xs mx-auto space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Processing</span>
              <span className="font-medium">Please wait</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        </div>
      )}

      {/* Result Step */}
      {step === 'result' && analysisResult && (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center">
            <div className="mb-4">{getStatusIcon(analysisResult.status)}</div>
            <h2 className="text-2xl font-bold font-display">Analysis Complete</h2>
            <div className="mt-3">
              <StatusBadge status={analysisResult.status} size="lg" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Confidence: {analysisResult.confidence.toFixed(1)}%
            </p>
          </div>

          {/* Parameters */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card rounded-xl border p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">pH Level</p>
              <p className="text-2xl font-bold mt-1">{analysisResult.parameters.ph.toFixed(1)}</p>
            </div>
            <div className="bg-card rounded-xl border p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Chlorine</p>
              <p className="text-2xl font-bold mt-1">{analysisResult.parameters.chlorine.toFixed(1)} <span className="text-sm font-normal">ppm</span></p>
            </div>
            <div className="bg-card rounded-xl border p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Turbidity</p>
              <p className="text-2xl font-bold mt-1">{analysisResult.parameters.turbidity.toFixed(1)} <span className="text-sm font-normal">NTU</span></p>
            </div>
            <div className="bg-card rounded-xl border p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Hardness</p>
              <p className="text-2xl font-bold mt-1">{analysisResult.parameters.hardness.toFixed(0)} <span className="text-sm font-normal">ppm</span></p>
            </div>
          </div>

          {/* Recommendations */}
          <div className={cn(
            'rounded-xl border p-4',
            analysisResult.status === 'safe' && 'bg-status-safe-bg border-status-safe/20',
            analysisResult.status === 'borderline' && 'bg-status-borderline-bg border-status-borderline/20',
            analysisResult.status === 'unsafe' && 'bg-status-unsafe-bg border-status-unsafe/20'
          )}>
            <h4 className="font-semibold mb-2">Recommendations</h4>
            <ul className="space-y-1.5">
              {analysisResult.recommendations.map((rec, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={resetUpload} className="flex-1" disabled={isSaving}>
              <RotateCcw className="h-4 w-4 mr-2" />
              New Test
            </Button>
            <Button className="flex-1" onClick={handleSaveResult} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              {isSaving ? 'Saving...' : 'Save Result'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
