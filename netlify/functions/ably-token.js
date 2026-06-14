exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: 'Method Not Allowed' };
  try {
    const { clientId } = JSON.parse(event.body || '{}');
    if (!clientId) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing clientId' }) };
    const ABLY_KEY = process.env.ABLY_API_KEY;
    if (!ABLY_KEY) return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server config error' }) };
    const [keyName] = ABLY_KEY.split(':');
    const tokenParams = { clientId, capability: JSON.stringify({ 'sol:*': ['subscribe', 'publish', 'presence', 'history'] }), ttl: 3600000 };
    const response = await fetch(`https://rest.ably.io/keys/${keyName}/requestToken`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ${Buffer.from(ABLY_KEY).toString('base64')}` }, body: JSON.stringify(tokenParams) });
    const token = await response.json();
    return { statusCode: 200, headers, body: JSON.stringify(token) };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Token generation failed' }) };
  }
};

