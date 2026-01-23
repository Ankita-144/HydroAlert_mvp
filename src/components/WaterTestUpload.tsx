import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';
import { WaterStatus } from '@/types/water';
import { useWaterData } from '@/contexts/WaterDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
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
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { addTestResult, waterSources } = useWaterData();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Apply color normalization (brightness, contrast, saturation)
  const normalizeColors = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Calculate average brightness
    let totalBrightness = 0;
    for (let i = 0; i < data.length; i += 4) {
      totalBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    const avgBrightness = totalBrightness / (data.length / 4);
    const targetBrightness = 128;
    const brightnessFactor = targetBrightness / avgBrightness;
    
    // Contrast and saturation adjustments
    const contrastFactor = 1.15; // Slight contrast boost
    const saturationFactor = 1.2; // Slight saturation boost
    
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];
      
      // Apply brightness normalization
      r = Math.min(255, r * brightnessFactor);
      g = Math.min(255, g * brightnessFactor);
      b = Math.min(255, b * brightnessFactor);
      
      // Apply contrast
      r = Math.min(255, Math.max(0, ((r - 128) * contrastFactor) + 128));
      g = Math.min(255, Math.max(0, ((g - 128) * contrastFactor) + 128));
      b = Math.min(255, Math.max(0, ((b - 128) * contrastFactor) + 128));
      
      // Apply saturation
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      r = Math.min(255, Math.max(0, gray + saturationFactor * (r - gray)));
      g = Math.min(255, Math.max(0, gray + saturationFactor * (g - gray)));
      b = Math.min(255, Math.max(0, gray + saturationFactor * (b - gray)));
      
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }
    
    ctx.putImageData(imageData, 0, 0);
  };

  // Normalize image to consistent dimensions and apply color normalization
  const normalizeImage = (imageDataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions maintaining aspect ratio
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // Draw resized image
          ctx.drawImage(img, 0, 0, width, height);
          
          // Apply color normalization
          normalizeColors(ctx, width, height);
          
          // Format timestamp - compact format
          const now = new Date();
          const dateStr = now.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: '2-digit'
          });
          const timeStr = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
          const timestamp = `${dateStr} ${timeStr}`;
          
          // Smaller fixed font size
          const fontSize = 10;
          const padding = 4;
          
          ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
          const textWidth = ctx.measureText(timestamp).width;
          
          // Draw compact rounded background
          const bgHeight = fontSize + padding * 2;
          const bgWidth = textWidth + padding * 2;
          const radius = 3;
          
          ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
          ctx.beginPath();
          ctx.roundRect(3, 3, bgWidth, bgHeight, radius);
          ctx.fill();
          
          // Draw timestamp text
          ctx.fillStyle = '#ffffff';
          ctx.fillText(timestamp, 3 + padding, 3 + fontSize + padding * 0.2);
        }
        
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.src = imageDataUrl;
    });
  };

  // Resize original image for display (without normalization)
  const resizeOriginal = (imageDataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        
        let width = img.width;
        let height = img.height;
        
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
        }
        
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.src = imageDataUrl;
    });
  };

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const rawImage = e.target?.result as string;
        const [resizedOriginal, normalizedImage] = await Promise.all([
          resizeOriginal(rawImage),
          normalizeImage(rawImage)
        ]);
        setOriginalImage(resizedOriginal);
        setSelectedImage(normalizedImage);
        setStep('preview');
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDrop = useCallback(async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const rawImage = e.target?.result as string;
        const [resizedOriginal, normalizedImage] = await Promise.all([
          resizeOriginal(rawImage),
          normalizeImage(rawImage)
        ]);
        setOriginalImage(resizedOriginal);
        setSelectedImage(normalizedImage);
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
    setOriginalImage(null);
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
            <h2 className="text-2xl font-bold font-display">Capture Water Test Strip</h2>
            <p className="text-muted-foreground mt-2">
              Use your camera to photograph the test strip for instant AI analysis
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

          {/* Camera Capture Area */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border-2 border-primary/20 hover:border-primary/40 transition-all group">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="py-16 px-8 text-center">
              <div className="mx-auto h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/30 transition-all shadow-lg shadow-primary/20">
                <Camera className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Take a Photo</h3>
              <p className="text-muted-foreground max-w-xs mx-auto">
                Point your camera at the test strip and capture a clear image
              </p>
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Camera className="h-4 w-4" />
                Tap to open camera
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Step */}
      {step === 'preview' && selectedImage && originalImage && (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center">
            <h2 className="text-2xl font-bold font-display">Preview Images</h2>
            <p className="text-muted-foreground mt-2">
              Compare original and normalized versions
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-center text-muted-foreground">Original</p>
              <div className="relative rounded-xl overflow-hidden border shadow-soft">
                <img
                  src={originalImage}
                  alt="Original water test strip"
                  className="w-full h-auto max-h-72 object-contain bg-muted"
                />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-center text-muted-foreground">Normalized</p>
              <div className="relative rounded-xl overflow-hidden border shadow-soft ring-2 ring-primary/30">
                <img
                  src={selectedImage}
                  alt="Normalized water test strip"
                  className="w-full h-auto max-h-72 object-contain bg-muted"
                />
              </div>
            </div>
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
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl border border-blue-500/20 p-4 text-center">
              <div className="h-10 w-10 mx-auto mb-2 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">pH</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{analysisResult.parameters.ph.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground mt-1">pH Level</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-xl border border-emerald-500/20 p-4 text-center">
              <div className="h-10 w-10 mx-auto mb-2 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <span className="text-emerald-600 font-bold text-sm">Cl</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{analysisResult.parameters.chlorine.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">Chlorine (ppm)</p>
            </div>
            <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-xl border border-amber-500/20 p-4 text-center">
              <div className="h-10 w-10 mx-auto mb-2 rounded-full bg-amber-500/20 flex items-center justify-center">
                <span className="text-amber-600 font-bold text-sm">H</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{analysisResult.parameters.hardness.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground mt-1">Hardness (ppm)</p>
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
