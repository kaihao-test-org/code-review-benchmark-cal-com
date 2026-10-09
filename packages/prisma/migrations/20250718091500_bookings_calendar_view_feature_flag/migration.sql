INSERT INTO
  "Feature" (slug, enabled, description, "type")
VALUES
  (
    'bookings-calendar-view',
    false,
    'Enable the calendar view on the bookings page',
    'RELEASE'
  ) ON CONFLICT (slug) DO NOTHING;
