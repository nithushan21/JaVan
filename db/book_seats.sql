-- SQL to create an atomic booking function for Supabase
-- Run this in the Supabase SQL editor (or psql) as the DB admin

-- Creates a function `public.book_seats(p_trip_id integer, p_passenger_name text, p_passenger_phone text, p_seat_numbers text)`
-- Returns a jsonb object: { status: 'ok', id: <booking_id> } or { status: 'conflict', seats: [...] }

CREATE OR REPLACE FUNCTION public.book_seats(
  p_trip_id integer,
  p_passenger_name text,
  p_passenger_phone text,
  p_seat_numbers text
) RETURNS jsonb AS $$
DECLARE
  req_seats text[];
  existing_seats text[];
  conflict_seats text[];
  ins_id bigint;
BEGIN
  -- normalize requested seats into an array
  req_seats := (SELECT array_agg(trim(s)) FROM unnest(string_to_array(p_seat_numbers, ',')) s);

  IF req_seats IS NULL THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'No seats requested');
  END IF;

  -- Lock the trip row to serialize booking operations for the same trip
  PERFORM 1 FROM trips WHERE id = p_trip_id FOR UPDATE;

  -- Aggregate existing booked seats for the trip
  SELECT array_agg(trim(s)) INTO existing_seats
  FROM (
    SELECT unnest(string_to_array(seat_numbers, ',')) AS s
    FROM bookings
    WHERE trip_id = p_trip_id
  ) t;

  IF existing_seats IS NULL THEN
    existing_seats := ARRAY[]::text[];
  END IF;

  -- compute intersection
  SELECT array_agg(s) INTO conflict_seats
  FROM (
    SELECT unnest(req_seats) AS s
    INTERSECT
    SELECT unnest(existing_seats) AS s
  ) x;

  IF conflict_seats IS NOT NULL THEN
    RETURN jsonb_build_object('status','conflict','seats', conflict_seats);
  END IF;

  -- safe to insert
  INSERT INTO bookings(trip_id, passenger_name, passenger_phone, seat_numbers, status, created_at)
  VALUES (p_trip_id, p_passenger_name, p_passenger_phone, array_to_string(req_seats, ','), 'confirmed', now())
  RETURNING id INTO ins_id;

  RETURN jsonb_build_object('status','ok','id', ins_id);
END;
$$ LANGUAGE plpgsql VOLATILE;

-- You may DROP FUNCTION public.book_seats(integer, text, text, text);
