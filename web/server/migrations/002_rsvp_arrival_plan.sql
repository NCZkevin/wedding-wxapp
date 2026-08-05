ALTER TABLE rsvps
  DROP INDEX idx_rsvps_phone,
  DROP COLUMN phone,
  DROP COLUMN diet,
  ADD COLUMN transport_mode VARCHAR(40) NOT NULL DEFAULT '' AFTER guest_count,
  ADD COLUMN arrival_time DATETIME NULL AFTER transport_mode,
  ADD COLUMN arrival_location VARCHAR(120) NOT NULL DEFAULT '' AFTER arrival_time,
  ADD INDEX idx_rsvps_arrival_time (arrival_time);
