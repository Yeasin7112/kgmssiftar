import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Create admin user
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email: 'admin@gmail.com',
    password: 'admin123@@',
    email_confirm: true,
  });

  if (userError && !userError.message.includes('already')) {
    return new Response(JSON.stringify({ error: userError.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }

  // Find admin user
  const { data: users } = await supabase.auth.admin.listUsers();
  const adminUser = users?.users?.find(u => u.email === 'admin@gmail.com');
  if (!adminUser) {
    return new Response(JSON.stringify({ error: 'Admin user not found' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }

  // Assign admin role
  const { error: roleError } = await supabase
    .from('user_roles')
    .upsert({ user_id: adminUser.id, role: 'admin' }, { onConflict: 'user_id,role' });

  if (roleError) {
    return new Response(JSON.stringify({ error: roleError.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }

  return new Response(JSON.stringify({ success: true, userId: adminUser.id }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
});
