import { neon } from '@netlify/neon';

// Get DATABASE_URL from environment variables
const sql = neon(process.env.DATABASE_URL);

export default async (req) => {
  // Enable CORS for admin panel
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers
    });
  }

  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'Username and password are required' }), {
        status: 400,
        headers
      });
    }

    // FIXED: Using 'admin' table (singular) to match your schema
    const [admin] = await sql`
      SELECT id, username FROM admin
      WHERE username = ${username} AND password = ${password}
    `;

    if (!admin) {
      return new Response(JSON.stringify({ error: 'Invalid username or password' }), {
        status: 401,
        headers
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      admin: { id: admin.id, username: admin.username }
    }), {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return new Response(JSON.stringify({ error: 'Server error. Please try again.' }), {
      status: 500,
      headers
    });
  }
};

export const config = { path: '/api/admin-login' };
