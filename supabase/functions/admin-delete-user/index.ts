import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No autorizado');
    }

    // Get target user ID from body
    const { userId: targetUserId } = await req.json();
    if (!targetUserId) {
      throw new Error('ID de usuario requerido');
    }

    console.log('[DELETE] Target user:', targetUserId);

    // Create Supabase admin client (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Extract token and get user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Token inválido');
    }

    console.log('[DELETE] Requesting user:', user.id);

    // Check if requesting user is admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      throw new Error('No autorizado - se requieren permisos de administrador');
    }

    console.log('[DELETE] Admin verified, starting cascade delete');

    // CASCADE DELETE using admin client (bypasses all RLS)
    
    // 1. User roles
    await supabaseAdmin.from('user_roles').delete().eq('user_id', targetUserId);
    
    // 2. Session analytics
    await supabaseAdmin.from('session_analytics').delete().eq('user_id', targetUserId);
    
    // 3. Notifications
    await supabaseAdmin.from('notifications').delete().eq('user_id', targetUserId);
    
    // 4. Chat history
    await supabaseAdmin.from('chat_history').delete().eq('user_id', targetUserId);
    
    // 5. Get initiatives to cascade
    const { data: initiatives } = await supabaseAdmin
      .from('initiatives')
      .select('id')
      .eq('user_id', targetUserId);
    
    if (initiatives && initiatives.length > 0) {
      const initIds = initiatives.map(i => i.id);
      
      // Get stages
      const { data: stages } = await supabaseAdmin
        .from('initiative_stages')
        .select('id')
        .in('initiative_id', initIds);
      
      if (stages && stages.length > 0) {
        const stageIds = stages.map(s => s.id);
        await supabaseAdmin.from('initiative_activities').delete().in('stage_id', stageIds);
      }
      
      await supabaseAdmin.from('initiative_stages').delete().in('initiative_id', initIds);
      await supabaseAdmin.from('initiative_comments').delete().in('initiative_id', initIds);
      await supabaseAdmin.from('initiative_collaborators').delete().in('initiative_id', initIds);
    }
    
    // 6. Collaborations where user is collaborator
    await supabaseAdmin.from('initiative_collaborators').delete().eq('user_id', targetUserId);
    
    // 7. Initiatives
    await supabaseAdmin.from('initiatives').delete().eq('user_id', targetUserId);
    
    // 8. Get use cases to cascade
    const { data: useCases } = await supabaseAdmin
      .from('use_cases')
      .select('id')
      .eq('user_id', targetUserId);
    
    if (useCases && useCases.length > 0) {
      const ucIds = useCases.map(u => u.id);
      await supabaseAdmin.from('roadmap').delete().in('use_case_id', ucIds);
    }
    
    // 9. Use cases
    await supabaseAdmin.from('use_cases').delete().eq('user_id', targetUserId);
    
    // 10. Evaluations
    await supabaseAdmin.from('evaluations').delete().eq('user_id', targetUserId);
    
    // 11. Chat messages
    await supabaseAdmin.from('chat_messages').delete().eq('sender_id', targetUserId);
    
    // 12. Conversations
    await supabaseAdmin
      .from('conversations')
      .delete()
      .or(`participant1_id.eq.${targetUserId},participant2_id.eq.${targetUserId}`);
    
    // 13. Support messages
    await supabaseAdmin.from('support_messages').delete().eq('sender_id', targetUserId);
    
    // 14. Support conversations (unlink)
    await supabaseAdmin
      .from('support_conversations')
      .update({ user_id: null })
      .eq('user_id', targetUserId);
    
    // 15. Profile
    await supabaseAdmin.from('profiles').delete().eq('id', targetUserId);
    
    // 16. Auth user
    await supabaseAdmin.auth.admin.deleteUser(targetUserId);

    console.log('[DELETE] Success');

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('[DELETE] Error:', error);
    const errorMsg = error instanceof Error ? error.message : 'Error al eliminar usuario';
    return new Response(
      JSON.stringify({ error: errorMsg }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
