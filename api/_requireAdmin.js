export function requireAdmin(req, res) {
    const expected = process.env.ADMIN_TOKEN;
    const authHeader = req.headers.authorization || '';
  
    const provided = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;
  
    if (!expected || !provided || provided !== expected) {
      res.status(401).json({ error: 'Unauthorized' });
      return false;
    }
  
    return true;
  }