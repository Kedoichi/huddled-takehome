import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  const db = locals.db;

  if (!db) {
    throw new Error("Database not initialized");
  }
  try {
    const query = `
    WITH RECURSIVE 
    timezone_offsets AS (
      SELECT 
        'America/New_York' as timezone, -4 as offset_hours UNION ALL
        SELECT 'America/Los_Angeles', -7 UNION ALL
        SELECT 'Europe/London', 1 UNION ALL
        SELECT 'Asia/Tokyo', 9 UNION ALL
        SELECT 'Australia/Sydney', 10 UNION ALL
        SELECT 'Africa/Johannesburg', 2
    ),
    adjusted_events AS (
      SELECT 
        ue.artist_id,
        a.name as artist_name,
        -- Convert UTC hour to local hour
        (strftime('%H', datetime(ue.created_at/1000, 'unixepoch')) + 
         tzo.offset_hours + 24) % 24 as local_hour,
        strftime('%w', datetime(ue.created_at/1000, 'unixepoch', 
         tzo.offset_hours || ' hours')) as day_of_week,
        CASE ue.event_type
          WHEN 'like_track' THEN 2
          WHEN 'add_track_to_playlist' THEN 2
          WHEN 'play_track' THEN 1
          WHEN 'share_track' THEN 3
          ELSE 0
        END as engagement_score
      FROM user_events ue
      JOIN artists a ON ue.artist_id = a.id
      JOIN users u ON ue.user_id = u.id
      JOIN timezone_offsets tzo ON u.timezone = tzo.timezone
      WHERE ue.event_type IN ('like_track', 'add_track_to_playlist', 'play_track', 'share_track')
    )
        SELECT 
            artist_id,
            artist_name,
            local_hour,
            day_of_week,
            SUM(engagement_score) as total_engagement,
            COUNT(*) as event_count
        FROM adjusted_events
        GROUP BY artist_id, artist_name, local_hour, day_of_week
        ORDER BY artist_id, day_of_week, local_hour;
    `;

    const data = await db.prepare(query).all();

    const artistsQuery = `
    SELECT DISTINCT id, name 
    FROM artists 
    ORDER BY name
  `;
    const artists = await db.prepare(artistsQuery).all();

    const eventTypesQuery = `   
    SELECT 
      ue.artist_id,
      a.name as artist_name,
      ue.event_type,
      COUNT(*) as count,
      CASE ue.event_type
        WHEN 'share_track' THEN 3
        WHEN 'like_track' THEN 2
        WHEN 'add_track_to_playlist' THEN 2
        WHEN 'play_track' THEN 1
      END as weight,
      COUNT(*) * CASE ue.event_type
        WHEN 'share_track' THEN 3
        WHEN 'like_track' THEN 2
        WHEN 'add_track_to_playlist' THEN 2
        WHEN 'play_track' THEN 1
      END as weighted_count
    FROM user_events ue
    JOIN artists a ON ue.artist_id = a.id
    WHERE ue.event_type IN ('share_track', 'like_track', 'add_track_to_playlist', 'play_track')
    GROUP BY ue.artist_id, a.name, ue.event_type
    ORDER BY ue.artist_id, weighted_count DESC;
        `;
    const eventTypes = await db.prepare(eventTypesQuery).all();

    return {
      data,
      artists,
      eventTypes,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch data");
  }
};
