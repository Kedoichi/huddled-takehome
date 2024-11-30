import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  const db = locals.db;

  if (!db) {
    throw new Error("Database not initialized");
  }
  try {
    const query = `
SELECT 
    a.id AS artist_id, 
    a.name AS artist_name, 
    SUM(v.end_time - v.start_time) AS total_visit_duration,
    COUNT(DISTINCT s.user_id) AS unique_session_count
  FROM artists a
      LEFT JOIN visits v ON a.id = v.artist_id
      LEFT JOIN sessions s ON v.session_id = s.id
      GROUP BY a.id, a.name
      ORDER BY total_visit_duration DESC
`;

    const data = await db.prepare(query).all();
    return {
      data,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch data");
  }
};
