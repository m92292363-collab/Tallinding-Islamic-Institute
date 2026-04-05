import { neon } from '@neondatabase/serverless';

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

    let students;

    if (gradeLevel && className) {
      students = await sql`
        SELECT id, student_id, full_name, grade_level, class_name, 
               date_of_birth, guardian_name, guardian_phone, student_phone, address
        FROM students
        WHERE grade_level = ${parseInt(gradeLevel)} AND class_name = ${className}
        ORDER BY grade_level, class_name, student_id
      `;
    } else if (gradeLevel) {
      students = await sql`
        SELECT id, student_id, full_name, grade_level, class_name, 
               date_of_birth, guardian_name, guardian_phone, student_phone, address
        FROM students
        WHERE grade_level = ${parseInt(gradeLevel)}
        ORDER BY class_name, student_id
      `;
    } else if (className) {
      students = await sql`
        SELECT id, student_id, full_name, grade_level, class_name, 
               date_of_birth, guardian_name, guardian_phone, student_phone, address
        FROM students
        WHERE class_name = ${className}
        ORDER BY grade_level, student_id
      `;
    } else {
      students = await sql`
        SELECT id, student_id, full_name, grade_level, class_name, 
               date_of_birth, guardian_name, guardian_phone, student_phone, address
        FROM students
        ORDER BY grade_level, class_name, student_id
      `;
    }

    return new Response(JSON.stringify({ success: true, students }), {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Get all students error:', error);
    return new Response(JSON.stringify({ error: 'Server error. Please try again.' }), {
      status: 500,
      headers
    });
  }
};

export const config = { path: '/api/get-all-students' };
