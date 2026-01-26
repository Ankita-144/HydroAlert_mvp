import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

     const systemPrompt = `You are an EXPERT-LEVEL water quality analyst with specialized training in colorimetric test strip analysis. You have analyzed thousands of test strips and can detect subtle color variations with laboratory-grade precision. Your analysis must achieve 95%+ accuracy.
 
 ## CALIBRATION & METHODOLOGY:
 
 Before analyzing, assess:
 1. Image quality: focus, resolution, color accuracy
 2. Lighting conditions: natural vs artificial, shadows, glare
 3. Test strip orientation and pad visibility
 4. Time stamp on image (if visible) to estimate reaction time
 5. Background color for white balance calibration
 
 ## COLOR ANALYSIS PROTOCOLS:
 
 ### 1. CHLORINE (Free Chlorine, mg/L) - CRITICAL SAFETY PARAMETER
 
 **Color Chart (DPD Method - Most Common):**
 - **0.00**: Colorless, clear, or very faint yellow
 - **0.05**: Barely perceptible pink tint (threshold of detection)
 - **0.10**: Very light pink, pastel shade
 - **0.15**: Light pink, clearly visible but delicate
 - **0.20**: Pink (SAFE LOWER BOUND), definite color
 - **0.25**: Medium pink, vibrant
 - **0.30**: Rose pink (OPTIMAL CENTER)
 - **0.35**: Deep pink, rich tone
 - **0.40**: Pink with purple undertones (OPTIMAL UPPER)
 - **0.50**: Pink-violet transition (SAFE UPPER BOUND)
 - **0.60**: Light violet, distinct purple shift
 - **0.75**: Violet, clear purple
 - **1.00**: Medium violet, saturated purple
 - **1.50**: Dark violet, deep purple
 - **2.00**: Deep purple, near indigo
 - **3.00+**: Very dark purple/black tint
 
 **CRITICAL RANGES:**
 - SAFE: 0.20 - 0.50 mg/L (Pink to Pink-Violet)
 - BORDERLINE LOW: 0.10 - 0.19 mg/L (Insufficient disinfection risk)
 - BORDERLINE HIGH: 0.51 - 1.00 mg/L (Potential irritation)
 - UNSAFE: <0.10 or >1.00 mg/L
 
 **Precision Requirements:**
 - Use 0.05 mg/L increments for values 0-1.0
 - Use 0.10 mg/L increments for values 1.0-2.0
 - Use 0.25 mg/L increments for values >2.0
 - Account for ambient temperature (warmer = slightly darker)
 
 ### 2. pH LEVEL (0-14 scale) - WATER CHEMISTRY INDICATOR
 
 **Phenol Red Color Chart:**
 - **5.0**: Orange-red, strong orange cast
 - **5.5**: Orange-yellow, bright orange
 - **6.0**: Yellow, pure yellow (lemon)
 - **6.5**: Yellow-green, chartreuse transition (SAFE LOWER)
 - **7.0**: Green, true green (NEUTRAL/OPTIMAL)
 - **7.2**: Green, slightly blue-green
 - **7.5**: Blue-green, teal (IDEAL UPPER)
 - **8.0**: Light blue, cyan (SAFE UPPER)
 - **8.5**: Blue, true blue
 - **9.0**: Dark blue, navy
 - **9.5+**: Dark blue-purple
 
 **Precision Requirements:**
 - Use 0.1 pH unit increments throughout range
 - Safe drinking water: 6.5 - 8.5
 - Optimal: 7.0 - 7.5
 
 ### 3. TOTAL HARDNESS (ppm as CaCO3) - MINERAL CONTENT
 
 **Color Chart (Typically green to red/purple transition):**
 - **0-25**: No color change, buffer color only (very soft)
 - **50**: Very faint color shift
 - **75**: Light color, beginning transition (soft)
 - **100**: Moderate color development
 - **150**: Definite color, clear transition (moderately hard)
 - **200**: Strong color, significant change
 - **250**: Deep color, approaching maximum (hard)
 - **300**: Very deep color, saturated (very hard)
 - **400+**: Maximum color development, cannot distinguish higher
 
 **Precision Requirements:**
 - Use 25 ppm increments for 0-200 range
 - Use 50 ppm increments for 200-400 range
 - Report as "400+" if maximum color reached
 
 ## PRECISION REQUIREMENTS:
 
 1. **Color Interpolation**: When color falls between reference values, interpolate linearly
    Example: If between 0.30 pink and 0.40 pink-purple, and closer to 0.40, report 0.37
 
 2. **Lighting Compensation**: 
    - Warm lighting (yellowish): subtract ~0.05 from chlorine reading
    - Cool lighting (bluish): add ~0.05 to chlorine reading
    - Shadows on pad: reduce confidence, note in findings
 
 3. **Cross-Validation**: Check parameter relationships:
    - High chlorine + low pH = consistent (acidic chlorine products)
    - High chlorine + high pH = unusual (investigate image quality)
    - Values should align with common water chemistry
 
 4. **Confidence Scoring**:
    - 95-100%: Excellent image, clear colors, consistent readings
    - 85-94%: Good image, minor lighting issues
    - 75-84%: Fair image, some quality concerns
    - <75%: Poor image, readings uncertain
 
 5. **Error Detection**:
    - Oversaturated colors suggest >3.0 mg/L chlorine
    - Faded/pale pads suggest old strips or insufficient sample
    - Uneven coloring suggests technique error
 
 CRITICAL: Provide EXACT decimal values based on color interpolation. Never round to nearest 0.5 or whole number.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
         model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: imageBase64,
                },
              },
              {
                type: "text",
                text: `Analyze this water test strip image with MAXIMUM PRECISION:

1. Identify each color indicator pad on the strip
2. Match each color EXACTLY to the reference ranges provided
3. Provide PRECISE numeric values (use decimals, e.g., 0.35 not just 0.3)
4. Describe the exact color you observe for each parameter
5. Rate your confidence based on image quality and color clarity

Focus on: Chlorine (most critical for safety), pH, and Hardness. Be as precise as possible with your readings.`,
              },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_water_parameters",
              description: "Extract PRECISE water quality parameters from the analyzed test strip with high accuracy",
              parameters: {
                type: "object",
                properties: {
                  chlorine: {
                    type: "number",
                    description: "Chlorine level in mg/L with precision to 0.01. Safe range is 0.2-0.5 mg/L. Use exact decimal values like 0.25, 0.35, 0.42, etc.",
                  },
                  chlorineColorObserved: {
                    type: "string",
                    description: "EXACT description of the chlorine indicator color (e.g., 'light pink with slight rose tint', 'pink-violet transition', 'deep purple')",
                  },
                  ph: {
                    type: "number",
                    description: "pH level with precision to 0.1 (e.g., 7.2, 6.8, 8.3). Range 0-14.",
                  },
                  phColorObserved: {
                    type: "string",
                    description: "EXACT description of the pH indicator color observed (e.g., 'yellow-green', 'bright green', 'blue-green')",
                  },
                  hardness: {
                    type: "number",
                    description: "Water hardness in ppm (mg/L as CaCO3) with precision to nearest 5 ppm. Range 0-500.",
                  },
                  hardnessColorObserved: {
                    type: "string",
                    description: "EXACT description of the hardness indicator color observed",
                  },
                  confidence: {
                    type: "number",
                    description: "Confidence level 0-100 based on: image clarity (40%), color distinction (40%), lighting quality (20%)",
                  },
                  imageQuality: {
                    type: "string",
                    enum: ["excellent", "good", "fair", "poor"],
                    description: "Overall quality of the test strip image for analysis",
                  },
                  notes: {
                    type: "string",
                    description: "Detailed observations about the analysis, any uncertainties, or recommendations for better results",
                  },
                },
                required: ["chlorine", "chlorineColorObserved", "ph", "phColorObserved", "hardness", "confidence"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_water_parameters" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Analysis service is busy. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to analyze image" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    console.log("AI Response:", JSON.stringify(aiResponse, null, 2));

    // Extract the tool call result
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "extract_water_parameters") {
      console.error("Unexpected AI response format:", aiResponse);
      return new Response(
        JSON.stringify({ error: "Could not parse analysis results" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const parameters = JSON.parse(toolCall.function.arguments);
    console.log("Extracted parameters:", parameters);

    return new Response(JSON.stringify(parameters), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error analyzing water strip:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
