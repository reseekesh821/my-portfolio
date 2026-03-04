import { getSupabaseAdminClient } from '../_supabaseAdmin.js';
import { requireAdmin } from '../_requireAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!requireAdmin(req, res)) return;

  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from('tab_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    console.error('Admin tab_events error:', error);
    return res.status(500).json({ error: 'Failed to load tab events' });
  }

  return res.status(200).json(data);
}