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

  // Verify caller is super admin (admin@gmail.com)
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Verify caller identity
  const userClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const { data: { user: caller } } = await userClient.auth.getUser();
  if (!caller || caller.email !== 'admin@gmail.com') {
    return new Response(JSON.stringify({ error: 'Only super admin can manage admins' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 });
  }

  const body = await req.json();
  const { action } = body;

  // LIST admins
  if (action === 'list') {
    const { data: roles } = await supabase.from('user_roles').select('id, user_id, role').eq('role', 'admin');
    if (!roles) return new Response(JSON.stringify({ admins: [] }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const admins = await Promise.all(roles.map(async (r) => {
      const { data: { user } } = await supabase.auth.admin.getUserById(r.user_id);
      return { id: r.id, user_id: r.user_id, email: user?.email || r.user_id };
    }));
    return new Response(JSON.stringify({ admins }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  // ADD admin by email
  if (action === 'add') {
    const { email } = body;
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const targetUser = users?.find(u => u.email === email);
    if (!targetUser) {
      return new Response(JSON.stringify({ error: `User with email "${email}" not found. They must sign up first.` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404,
      });
    }
    const { error } = await supabase.from('user_roles').upsert({ user_id: targetUser.id, role: 'admin' }, { onConflict: 'user_id,role' });
    if (error) return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  // REMOVE admin
  if (action === 'remove') {
    const { userId } = body;
    // Prevent removing super admin
    const { data: { user: targetUser } } = await supabase.auth.admin.getUserById(userId);
    if (targetUser?.email === 'admin@gmail.com') {
      return new Response(JSON.stringify({ error: 'Cannot remove super admin' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 });
    }
    await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', 'admin');
    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify({ error: 'Unknown action' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
});
