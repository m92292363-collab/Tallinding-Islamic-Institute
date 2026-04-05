import { neon } from '@netlify/neon';

const sql = neon(process.env.DATABASE_URL);

export default async (req) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers
    });
  }

  try {
    const url = new URL(req.url);
    const gradeLevel = url.searchParams.get('gradeLevel');
    const className = url.searchParams.get('className');
    const academicYear = url.searchParams.get('academicYear');
    const term = url.searchParams.get('term');

    // FIXED: Build query dynamically with proper parameterized conditions
    let query = `
      SELECT r.subject, r.score, r.grade, r.academic_year, r.term,
             s.student_id, s.full_name, s.grade_level, s.class_name
      FROM results r
      JOIN students s ON r.student_id = s.student_id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;

    if (gradeLevel) {
      query += ` AND s.grade_level = $${paramIndex}`;
      params.push(parseInt(gradeLevel));
      paramIndex++;
    }

    if (className) {
      query += ` AND s.class_name = $${paramIndex}`;
      params.push(className);
      paramIndex++;
    }

    if (academicYear) {
      query += ` AND r.academic_year = $${paramIndex}`;
      params.push(academicYear);
      paramIndex++;
    }

    if (term) {
      query += ` AND r.term = $${paramIndex}`;
      params.push(term);
      paramIndex++;
    }

    query += ` ORDER BY s.grade_level, s.class_name, s.student_id, r.subject`;

    // Execute with parameterized query
    const results = await sql(query, params);

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Get all results error:', error);
    return new Response(JSON.stringify({ error: 'Server error. Please try again.' }), {
      status: 500,
      headers
    });
  }
};

export const config = { path: '/api/get-all-results' };
