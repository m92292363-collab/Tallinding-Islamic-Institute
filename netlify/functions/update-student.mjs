import { neon } from '@netlify/neon';

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
    const { 
      studentId, 
      fullName, 
      gradeLevel, 
      className, 
      dateOfBirth, 
      guardianName, 
      guardianPhone, 
      studentPhone, 
      address 
    } = await req.json();

    if (!studentId) {
      return new Response(JSON.stringify({ error: 'Student ID is required' }), {
        status: 400,
        headers
      });
    }

    // Check if student exists
    const [student] = await sql`
      SELECT student_id FROM students WHERE student_id = ${studentId}
    `;

    if (!student) {
      return new Response(JSON.stringify({ error: `Student ID ${studentId} not found` }), {
        status: 404,
        headers
      });
    }

    // Build dynamic update query - only update fields that are provided
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (fullName !== undefined && fullName !== '') {
      updates.push(`full_name = $${paramIndex++}`);
      params.push(fullName);
    }
    if (gradeLevel !== undefined && gradeLevel !== '') {
      updates.push(`grade_level = $${paramIndex++}`);
      params.push(parseInt(gradeLevel));
    }
    if (className !== undefined && className !== '') {
      updates.push(`class_name = $${paramIndex++}`);
      params.push(className);
    }
    if (dateOfBirth !== undefined && dateOfBirth !== '') {
      updates.push(`date_of_birth = $${paramIndex++}`);
      params.push(dateOfBirth);
    }
    if (guardianName !== undefined && guardianName !== '') {
      updates.push(`guardian_name = $${paramIndex++}`);
      params.push(guardianName);
    }
    if (guardianPhone !== undefined && guardianPhone !== '') {
      updates.push(`guardian_phone = $${paramIndex++}`);
      params.push(guardianPhone);
    }
    if (studentPhone !== undefined && studentPhone !== '') {
      updates.push(`student_phone = $${paramIndex++}`);
      params.push(studentPhone);
    }
    if (address !== undefined && address !== '') {
      updates.push(`address = $${paramIndex++}`);
      params.push(address);
    }

    if (updates.length === 0) {
      return new Response(JSON.stringify({ error: 'No fields to update' }), {
        status: 400,
        headers
      });
    }

    params.push(studentId);
    const query = `UPDATE students SET ${updates.join(', ')} WHERE student_id = $${paramIndex}`;

    await sql(query, params);

    return new Response(JSON.stringify({ success: true, message: 'Student updated successfully' }), {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Update student error:', error);
    return new Response(JSON.stringify({ error: 'Server error. Please try again.' }), {
      status: 500,
      headers
    });
  }
};

export const config = { path: '/api/update-student' };
