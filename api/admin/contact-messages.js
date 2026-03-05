import { getSupabaseAdminClient } from '../_supabaseAdmin.js';
import { requireAdmin } from '../_requireAdmin.js';

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  const supabase = getSupabaseAdminClient();
  const method = req.method;

  if (method === 'GET') {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Admin contact_messages error:', error);
      return res.status(500).json({ error: 'Failed to load messages' });
    }
    return res.status(200).json(data);
  }

  const MESSAGE_MIN = 10;
  const MESSAGE_MAX = 500;

  if (method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { name, email, message } = body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'name, email, and message are required' });
    }
    const msg = String(message).trim();
    if (msg.length < MESSAGE_MIN) {
      return res.status(400).json({ error: 'Message must be at least ' + MESSAGE_MIN + ' characters' });
    }
    if (msg.length > MESSAGE_MAX) {
      return res.status(400).json({ error: 'Message must be at most ' + MESSAGE_MAX + ' characters' });
    }
    const { data, error } = await supabase
      .from('contact_messages')
      .insert([{ name: String(name).trim(), email: String(email).trim(), message: msg }])
      .select()
      .single();

    if (error) {
      console.error('Admin contact_messages insert error:', error);
      return res.status(500).json({ error: 'Failed to add message' });
    }
    return res.status(201).json(data);
  }

  if (method === 'PATCH') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const id = body.id != null ? Number(body.id) : NaN;
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: 'Valid id is required' });
    }
    const updates = {};
    if (body.name !== undefined) updates.name = String(body.name).trim();
    if (body.email !== undefined) updates.email = String(body.email).trim();
    if (body.message !== undefined) {
      const msg = String(body.message).trim();
      if (msg.length < MESSAGE_MIN) {
        return res.status(400).json({ error: 'Message must be at least ' + MESSAGE_MIN + ' characters' });
      }
      if (msg.length > MESSAGE_MAX) {
        return res.status(400).json({ error: 'Message must be at most ' + MESSAGE_MAX + ' characters' });
      }
      updates.message = msg;
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'At least one field to update (name, email, message) is required' });
    }

    const { data, error } = await supabase
      .from('contact_messages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Admin contact_messages update error:', error);
      return res.status(500).json({ error: 'Failed to update message' });
    }
    return res.status(200).json(data);
  }

  if (method === 'DELETE') {
    const id = req.query.id != null ? Number(req.query.id) : NaN;
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: 'Valid id query is required' });
    }
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    if (error) {
      console.error('Admin contact_messages delete error:', error);
      return res.status(500).json({ error: 'Failed to delete message' });
    }
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', 'GET, POST, PATCH, DELETE');
  return res.status(405).json({ error: 'Method not allowed' });
}
