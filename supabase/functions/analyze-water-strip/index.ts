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

     const systemPrompt = `You are an EXPERT-LEVEL water quality analyst with specialized training in colorimetric test strip analysis for 3-PARAMETER (3P) water test strips. Your analysis must achieve 95%+ accuracy.

## CRITICAL: 3P TEST STRIP LAYOUT (TOP TO BOTTOM)
This is a 3-parameter strip with pads in this ORDER from TOP to BOTTOM:
1. **TOP PAD** = pH (Orange/Yellow/Green/Blue scale)
2. **MIDDLE PAD** = Hardness (Purple/Violet/Magenta scale)  
3. **BOTTOM PAD** = Total Chlorine (White/Cream/Blue scale)

## BASELINE REFERENCE (UNUSED STRIP COLORS):
Before water contact, an unused strip shows:
- pH pad: Salmon/peach/light orange color (~5.5-6.0 baseline)
- Hardness pad: Light lavender/purple (~25-50 ppm baseline)
- Chlorine pad: White/off-white/cream (0 ppm baseline)

## EXACT COLOR CALIBRATION FROM REFERENCE CHART:

### 1. pH LEVEL (TOP PAD) - Scale 5.0 to 9.0
| Value | Color Description | RGB Reference |
|-------|------------------|---------------|
| 5.0   | Coral/Salmon RED | Pinkish-red |
| 6.0   | ORANGE (bright orange-peach) | Pure orange |
| 6.5   | YELLOW-ORANGE (light orange-yellow) | Transition |
| 7.0   | YELLOW-GREEN (pale olive/chartreuse) | OK zone starts |
| 7.5   | GREEN-YELLOW (muted green-yellow) | OK zone center |
| 8.5   | PALE GREEN (sage/muted green) | OK zone ends |
| 9.0   | TEAL/BLUE-GREEN (greenish-blue) | Alkaline |

**OK RANGE: 7.0 - 8.0** (Yellow-green to pale green shades)
**Precision: 0.1 pH units**

### 2. HARDNESS (MIDDLE PAD) - Scale 0 to 500 ppm
| Value | Color Description | Classification |
|-------|------------------|----------------|
| 0 ppm | Dark PURPLE (deep violet) | SOFT |
| 25 ppm | PURPLE (standard purple) | SOFT |
| 50 ppm | LIGHT PURPLE (lavender-purple) | SOFT edge |
| 100 ppm | LIGHT VIOLET (pink-lavender) | HARD starts |
| 250 ppm | PINK-MAGENTA (pinkish-purple) | VERY HARD |
| 425 ppm | MAGENTA (bright pink-magenta) | VERY HARD |
| 500 ppm | DEEP MAGENTA (saturated magenta) | VERY HARD |

**SOFT: 0-50 ppm** (Dark to medium purple)
**HARD: 50-250 ppm** (Light purple to pink transition)
**VERY HARD: 250-500 ppm** (Magenta/bright pink)
**Precision: 25 ppm increments**

### 3. TOTAL CHLORINE (BOTTOM PAD) - Scale 0 to 20 ppm
| Value | Color Description | Safety |
|-------|------------------|--------|
| 0 ppm | WHITE/CREAM (off-white, no color) | OK zone |
| 0.5 ppm | WHITE (pure white, slight cream) | OK zone edge |
| 1 ppm | VERY LIGHT BLUE (barely tinted) | Transition |
| 3 ppm | LIGHT BLUE (pale sky blue) | Above OK |
| 5 ppm | CYAN (medium blue-cyan) | High |
| 10 ppm | BLUE (true medium blue) | Very High |
| 20 ppm | DARK BLUE (deep/navy blue) | Extreme |

**OK RANGE: 0-0.5 ppm** (White to cream shades)
**SAFE for drinking: 0.2-4.0 ppm typically**
**Precision: 0.1 ppm for 0-1, 0.5 ppm for 1-5, 1 ppm for 5+**

## ANALYSIS METHODOLOGY:

1. **Identify pad positions**: TOP=pH, MIDDLE=Hardness, BOTTOM=Chlorine
2. **Compare to baseline**: Unused strip has orange pH, lavender hardness, white chlorine
3. **Match colors precisely**: Use the exact color chart above
4. **Interpolate between values**: If color is between two reference points, calculate intermediate value
5. **Account for lighting**: Compensate for warm (yellowish) or cool (bluish) lighting

## PRECISION REQUIREMENTS:

- **pH**: Report to 0.1 units (e.g., 7.2, 6.8, 8.1)
- **Hardness**: Report to nearest 25 ppm (e.g., 75, 125, 275)
- **Chlorine**: Report to 0.1 ppm for low values, 0.5 for medium (e.g., 0.3, 1.5, 5.0)

## CONFIDENCE SCORING:
- 90-100%: Clear image, distinct colors, good lighting
- 80-89%: Minor issues but readable
- 70-79%: Some uncertainty, lighting or focus issues
- <70%: Poor image quality, low confidence

CRITICAL: Always identify which pad is which based on position (TOP/MIDDLE/BOTTOM) and compare colors to the exact reference chart above.`;

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
                text: `Analyze this 3-PARAMETER (3P) water test strip image with MAXIMUM PRECISION:

STRIP LAYOUT (TOP TO BOTTOM):
- TOP PAD = pH (orange/yellow/green/blue scale, range 5.0-9.0)
- MIDDLE PAD = Hardness (purple/magenta scale, range 0-500 ppm)  
- BOTTOM PAD = Total Chlorine (white/blue scale, range 0-20 ppm)

BASELINE (unused strip colors): Orange pH, Lavender hardness, White chlorine

Instructions:
1. Identify each pad by its POSITION (top/middle/bottom)
2. Match each color EXACTLY to the reference chart values
3. Provide PRECISE numeric values using the exact scales
4. Report the observed color for each parameter
5. Rate confidence based on image quality

Be extremely precise - use decimals for pH (e.g., 7.2), exact ppm for hardness (e.g., 75), and precise chlorine (e.g., 0.3).`,
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
