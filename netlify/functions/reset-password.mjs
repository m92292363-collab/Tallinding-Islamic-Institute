import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async (req) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  if (req.method !== 'PUT') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers
    });
  }

  try {
    const { studentId, newPassword } = await req.json();

    if (!studentId || !newPassword) {
      return new Response(JSON.stringify({ error: 'Student ID and new password are required' }), {
        status: 400,
        headers
      });
    }

    const [student] = await sql`
      SELECT student_id FROM students WHERE student_id = ${studentId}
    `;

    if (!student) {
      return new Response(JSON.stringify({ error: `Student ID ${studentId} not found` }), {
        status: 404,
        headers
      });
    }

    await sql`
      UPDATE students 
      SET password = ${newPassword} 
      WHERE student_id = ${studentId}
    `;

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Password reset successfully for ${studentId}` 
    }), {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return new Response(JSON.stringify({ error: 'Server error. Please try again.' }), {
      status: 500,
      headers
    });
  }
};

export const config = { path: '/api/reset-password' };
