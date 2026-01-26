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

    const systemPrompt = `You are a HIGHLY PRECISE water quality analyst specializing in colorimetric test strip analysis. Your analysis must be EXTREMELY ACCURATE based on exact color matching.

## CRITICAL ANALYSIS INSTRUCTIONS:

### 1. CHLORINE LEVEL (mg/L) - PRIMARY INDICATOR
Analyze the chlorine indicator pad with EXTREME PRECISION:
- **Colorless/Very Light Yellow**: 0.0 mg/L (no chlorine detected)
- **Very Light Pink (barely visible)**: 0.1 mg/L
- **Light Pink**: 0.2 mg/L (entering safe zone)
- **Pink**: 0.3 mg/L (optimal - middle of safe range)
- **Rose Pink**: 0.4 mg/L (optimal)
- **Pink-Violet transition**: 0.5 mg/L (upper safe boundary)
- **Light Violet**: 0.6-0.7 mg/L (slightly elevated)
- **Violet**: 0.8-1.0 mg/L (elevated)
- **Dark Violet/Purple**: 1.0-1.5 mg/L (high)
- **Deep Purple**: 2.0+ mg/L (very high)

SAFE RANGE: 0.2-0.5 mg/L (Pink to Pink-Violet colors)

### 2. pH LEVEL (0-14 scale)
Match the pH indicator pad color PRECISELY:
- **Orange-Yellow**: pH 5.0-5.5 (acidic)
- **Yellow**: pH 6.0-6.5 (slightly acidic)
- **Yellow-Green**: pH 6.5-7.0 (near neutral)
- **Green**: pH 7.0-7.5 (neutral - ideal)
- **Blue-Green**: pH 7.5-8.0 (slightly alkaline)
- **Light Blue**: pH 8.0-8.5 (alkaline)
- **Blue**: pH 8.5-9.0 (more alkaline)
- **Dark Blue/Purple**: pH 9.0+ (highly alkaline)

IDEAL RANGE: 6.5-8.5 for drinking water

### 3. HARDNESS (ppm as CaCO3)
Analyze hardness indicator carefully:
- **Unchanged/Light**: 0-25 ppm (very soft)
- **Light color change**: 25-75 ppm (soft)
- **Moderate color**: 75-150 ppm (moderately hard)
- **Strong color**: 150-250 ppm (hard)
- **Very dark**: 250+ ppm (very hard)

## PRECISION REQUIREMENTS:
1. Examine each color pad individually and compare to reference standards
2. Consider lighting conditions and adjust interpretation accordingly
3. Be specific with decimal values (e.g., 0.35 mg/L, not just 0.3 or 0.4)
4. If colors are between two reference points, interpolate precisely
5. Note any image quality issues that may affect accuracy
6. Provide confidence based on image clarity and color distinction

Focus on the actual colors visible - do not assume or guess. If a color pad is unclear, note it but still provide your best estimate.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
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
