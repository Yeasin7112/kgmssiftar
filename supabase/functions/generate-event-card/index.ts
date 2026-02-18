const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, batch, participants_count } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('API key not configured');

    const prompt = `Create a beautiful Islamic Iftar event invitation card poster (1:1 square).
Style: Rich dark emerald green (#0d3020) background with golden (#f5c842) ornamental borders.
Include:
- Elegant golden crescent moon and star at the top
- Bold title in large text: "খেপুপাড়া হাইস্কুলিয়ান ইফতার ২০২৬"
- Subtitle: "২৮শে রমজান · ১৮ই মার্চ ২০২৬"
- Participant name in prominent gold text: "${name}"
- Batch label: "${batch}"
- Total participants: "${participants_count} জন অংশগ্রহণকারী"
- Footer: "খেপুপাড়া উপজেলা হাই স্কুল প্রাক্তন শিক্ষার্থী"
- Islamic geometric border pattern in gold
- Warm glowing mosque silhouette in background
Keep it elegant, professional, print-quality social media poster.`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image',
        messages: [{ role: 'user', content: prompt }],
        modalities: ['image', 'text'],
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const err = await response.text();
      if (response.status === 429) throw new Error('রেট লিমিট পৌঁছে গেছে, একটু পরে আবার চেষ্টা করুন');
      if (response.status === 402) throw new Error('AI ক্রেডিট শেষ, অ্যাডমিনকে জানান');
      throw new Error(`AI error: ${response.status} - ${err.slice(0, 200)}`);
    }

    const data = await response.json();
    const imageData = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageData) throw new Error('ছবি তৈরি হয়নি, আবার চেষ্টা করুন');

    return new Response(JSON.stringify({ imageUrl: imageData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'অজানা সমস্যা হয়েছে';
    const isTimeout = error instanceof Error && error.name === 'AbortError';
    console.error('Card generation error:', error);
    return new Response(
      JSON.stringify({ error: isTimeout ? 'সময় শেষ হয়ে গেছে, আবার চেষ্টা করুন' : msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

