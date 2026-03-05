import { getSupabaseAdminClient } from '../_supabaseAdmin.js';
import { requireAdmin } from '../_requireAdmin.js';

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  const supabase = getSupabaseAdminClient();
  const method = req.method;

  if (method === 'GET') {
    const { session_id, limit = '100' } = req.query;
    const rowLimit = Math.min(parseInt(limit, 10) || 100, 500);
    let query = supabase
      .from('chat_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(rowLimit);
    if (session_id) query = query.eq('session_id', session_id);
    const { data, error } = await query;
    if (error) {
      console.error('Admin chat_logs error:', error);
      return res.status(500).json({ error: 'Failed to load chat logs' });
    }
    return res.status(200).json(data);
  }

  if (method === 'PATCH') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const id = body.id != null ? Number(body.id) : NaN;
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: 'Valid id is required' });
    }
    const updates = {};
    if (body.content !== undefined) updates.content = String(body.content);
    if (body.role !== undefined) updates.role = String(body.role).trim();
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'At least one field (content, role) is required' });
    }
    const { data, error } = await supabase
      .from('chat_logs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('Admin chat_logs update error:', error);
      return res.status(500).json({ error: 'Failed to update' });
    }
    return res.status(200).json(data);
  }

  if (method === 'DELETE') {
    const id = req.query.id != null ? Number(req.query.id) : NaN;
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: 'Valid id query is required' });
    }
    const { error } = await supabase.from('chat_logs').delete().eq('id', id);
    if (error) {
      console.error('Admin chat_logs delete error:', error);
      return res.status(500).json({ error: 'Failed to delete' });
    }
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', 'GET, PATCH, DELETE');
  return res.status(405).json({ error: 'Method not allowed' });
}
