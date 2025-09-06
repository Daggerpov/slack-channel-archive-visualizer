export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { passkey } = req.body;

    if (!passkey || typeof passkey !== 'string') {
      return res.status(400).json({ error: 'Passkey is required' });
    }

    // Get the secure environment variables (these are NOT exposed to the frontend)
    const clubPasskeyHash = process.env.CLUB_PASSKEY_HASH;
    const adminPasskeyHash = process.env.ADMIN_PASSKEY_HASH;

    if (!clubPasskeyHash || !adminPasskeyHash) {
      console.error('Missing environment variables: CLUB_PASSKEY_HASH or ADMIN_PASSKEY_HASH');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Simple hash function (same as used in the frontend)
    const simpleHash = (str) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return hash.toString();
    };

    const inputHash = simpleHash(passkey);

    // Check against the secure hashes
    if (inputHash === adminPasskeyHash) {
      return res.status(200).json({ 
        success: true, 
        role: 'admin',
        message: 'Admin access granted' 
      });
    } else if (inputHash === clubPasskeyHash) {
      return res.status(200).json({ 
        success: true, 
        role: 'club',
        message: 'Club member access granted' 
      });
    } else {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid passkey' 
      });
    }

  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
