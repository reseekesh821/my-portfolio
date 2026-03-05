import { getSupabaseAdminClient } from '../_supabaseAdmin.js';
import { requireAdmin } from '../_requireAdmin.js';

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  const supabase = getSupabaseAdminClient();
  const method = req.method;

  if (method === 'GET') {
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

  if (method === 'PATCH') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const id = body.id != null ? Number(body.id) : NaN;
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: 'Valid id is required' });
    }
    const updates = {};
    if (body.tab_id !== undefined) updates.tab_id = String(body.tab_id).trim();
    if (body.event_type !== undefined) updates.event_type = String(body.event_type).trim();
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'At least one field (tab_id, event_type) is required' });
    }
    const { data, error } = await supabase
      .from('tab_events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('Admin tab_events update error:', error);
      return res.status(500).json({ error: 'Failed to update' });
    }
    return res.status(200).json(data);
  }

  if (method === 'DELETE') {
    const id = req.query.id != null ? Number(req.query.id) : NaN;
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: 'Valid id query is required' });
    }
    const { error } = await supabase.from('tab_events').delete().eq('id', id);
    if (error) {
      console.error('Admin tab_events delete error:', error);
      return res.status(500).json({ error: 'Failed to delete' });
    }
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', 'GET, PATCH, DELETE');
  return res.status(405).json({ error: 'Method not allowed' });
}
