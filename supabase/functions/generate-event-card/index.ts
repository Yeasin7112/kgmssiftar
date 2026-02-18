const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, batch, participants_count } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('API key not configured');

    const prompt = `Create a beautiful Islamic Iftar event invitation card image. 
Design requirements:
- Deep emerald green and gold color scheme, very rich and elegant
- Large bold Bengali/Arabic style title: "খেপুপাড়া হাইস্কুলিয়ান ইফতার ২০২৬"
- Subtitle: "২৮তম রমজান ইফতার মাহফিল"
- Feature participant name prominently: "${name}" — ${batch}
- Show "${participants_count} জন অংশগ্রহণকারী" 
- Islamic geometric border patterns and crescent moon decorations
- Ornate golden borders and ornamental dividers  
- "খেপুপাড়া উপজেলা হাই স্কুল প্রাক্তন শিক্ষার্থী" text at bottom
- "রমজান কারীম 🌙" at the bottom
- Professional social media poster design, 1:1 square ratio
- Elegant calligraphy-style text rendering
- Warm lantern glow effects, mosque silhouette in background
- Rich dark emerald background with golden text and ornaments`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro-image-preview',
        messages: [{ role: 'user', content: prompt }],
        modalities: ['image', 'text'],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`AI API error: ${err}`);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) throw new Error('No image generated');

    return new Response(JSON.stringify({ imageUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating card:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
