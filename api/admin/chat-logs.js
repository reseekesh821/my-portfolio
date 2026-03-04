import { getSupabaseAdminClient } from '../_supabaseAdmin.js';
import { requireAdmin } from '../_requireAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!requireAdmin(req, res)) return;

  const supabase = getSupabaseAdminClient();

  const { session_id, limit = '100' } = req.query;
  const rowLimit = Math.min(parseInt(limit, 10) || 100, 500);

  let query = supabase
    .from('chat_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(rowLimit);

  if (session_id) {
    query = query.eq('session_id', session_id);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Admin chat_logs error:', error);
    return res.status(500).json({ error: 'Failed to load chat logs' });
  }

  return res.status(200).json(data);
}