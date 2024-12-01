import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
  const db = locals.db;
  const viewMode = url.searchParams.get("viewMode") || "average";
  const timeRange = url.searchParams.get("timeRange") || "day";
  const date =
    url.searchParams.get("date") || new Date().toISOString().split("T")[0];

  if (!db) {
    throw new Error("Database not initialized");
  }
  try {
    let timeQuery = "";
    if (viewMode === "historical") {
      // Add time filtering based on the selected range
      const startDate = new Date(date);
      const endDate = new Date(date);

      switch (timeRange) {
        case "day":
          // No adjustment needed, use the date as is
          timeQuery = `AND date(datetime(ue.created_at/1000, 'unixepoch')) = date('${date}')`;
          break;
        case "week":
          // Adjust dates to get the full week
          startDate.setDate(startDate.getDate() - startDate.getDay());
          endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
          timeQuery = `AND date(datetime(ue.created_at/1000, 'unixepoch')) 
                      BETWEEN date('${startDate.toISOString().split("T")[0]}') 
                      AND date('${endDate.toISOString().split("T")[0]}')`;
          break;
        case "month":
          // Get the full month
          startDate.setDate(1);
          endDate.setMonth(endDate.getMonth() + 1);
          endDate.setDate(0);
          timeQuery = `AND date(datetime(ue.created_at/1000, 'unixepoch')) 
                      BETWEEN date('${startDate.toISOString().split("T")[0]}') 
                      AND date('${endDate.toISOString().split("T")[0]}')`;
          break;
        case "year":
          // Get the full year
          startDate.setMonth(0, 1);
          endDate.setMonth(11, 31);
          timeQuery = `AND date(datetime(ue.created_at/1000, 'unixepoch')) 
                      BETWEEN date('${startDate.toISOString().split("T")[0]}') 
                      AND date('${endDate.toISOString().split("T")[0]}')`;
          break;
      }
    }

    const query = `
    WITH RECURSIVE 
    timezone_offsets AS (
      SELECT 'America/New_York' as timezone, -4 as offset_hours UNION ALL
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
        ue.created_at,
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
      ${timeQuery}
    )
    SELECT 
        artist_id,
        artist_name,
        local_hour,
        day_of_week,
        date(datetime(created_at/1000, 'unixepoch')) as event_date,
        SUM(engagement_score) as total_engagement,
        COUNT(*) as event_count
    FROM adjusted_events
    GROUP BY 
        artist_id, 
        artist_name, 
        local_hour, 
        day_of_week,
        event_date
    ORDER BY 
        artist_id, 
        event_date,
        day_of_week, 
        local_hour;
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
    ${timeQuery}
    GROUP BY ue.artist_id, a.name, ue.event_type
    ORDER BY ue.artist_id, weighted_count DESC;
    `;
    const eventTypes = await db.prepare(eventTypesQuery).all();

    return {
      data,
      artists,
      eventTypes,
      metadata: {
        viewMode,
        timeRange,
        date,
      },
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch data");
  }
};
