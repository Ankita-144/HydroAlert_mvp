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

    const systemPrompt = `You are an expert water quality analyst specializing in test strip analysis. 
Analyze the water test strip image and extract the following parameters:

1. **Chlorine Level** (mg/L or ppm):
   - Look for the chlorine indicator pad color
   - Pink to light violet = 0.2-0.5 mg/L (SAFE - optimal range)
   - Light pink or colorless = <0.2 mg/L (LOW - insufficient disinfection)
   - Dark violet = 0.5-1.0 mg/L (SLIGHTLY ELEVATED)
   - Deep purple = >1.0 mg/L (HIGH - may cause irritation)

2. **pH Level** (0-14 scale):
   - Look for the pH indicator pad color
   - Yellow-green = acidic (pH 5-6)
   - Green = neutral (pH 7)
   - Blue-green to blue = alkaline (pH 8-9)
   - Ideal drinking water: 6.5-8.5

3. **Hardness** (ppm or mg/L as CaCO3):
   - Look for the hardness indicator pad
   - Soft: 0-60 ppm
   - Moderately hard: 61-120 ppm
   - Hard: 121-180 ppm
   - Very hard: >180 ppm

Analyze the colors carefully and provide your best estimates based on what you see.`;

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
                text: "Analyze this water test strip and extract the chlorine level, pH level, and hardness values. Provide specific numeric estimates based on the colors you observe.",
              },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_water_parameters",
              description: "Extract water quality parameters from the analyzed test strip",
              parameters: {
                type: "object",
                properties: {
                  chlorine: {
                    type: "number",
                    description: "Chlorine level in mg/L (ppm). Range 0-3.",
                  },
                  chlorineColorObserved: {
                    type: "string",
                    description: "Description of the chlorine indicator color observed",
                  },
                  ph: {
                    type: "number",
                    description: "pH level on scale of 0-14",
                  },
                  phColorObserved: {
                    type: "string",
                    description: "Description of the pH indicator color observed",
                  },
                  hardness: {
                    type: "number",
                    description: "Water hardness in ppm (mg/L as CaCO3). Range 0-500.",
                  },
                  hardnessColorObserved: {
                    type: "string",
                    description: "Description of the hardness indicator color observed",
                  },
                  confidence: {
                    type: "number",
                    description: "Confidence level of the analysis from 0-100",
                  },
                  notes: {
                    type: "string",
                    description: "Any additional observations about the test strip or image quality",
                  },
                },
                required: ["chlorine", "ph", "hardness", "confidence"],
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
