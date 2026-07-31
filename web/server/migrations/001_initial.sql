CREATE TABLE IF NOT EXISTS rsvps (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  client_id CHAR(36) NOT NULL,
  name VARCHAR(60) NOT NULL,
  phone VARCHAR(30) NULL,
  attendance ENUM('yes', 'unsure', 'no') NOT NULL,
  guest_count TINYINT UNSIGNED NOT NULL DEFAULT 1,
  diet VARCHAR(200) NOT NULL DEFAULT '',
  message VARCHAR(600) NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_rsvps_client_id (client_id),
  KEY idx_rsvps_phone (phone),
  KEY idx_rsvps_attendance (attendance),
  KEY idx_rsvps_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blessings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  client_id CHAR(36) NOT NULL,
  guest_name VARCHAR(60) NOT NULL DEFAULT '',
  message VARCHAR(600) NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_blessings_client_id (client_id),
  KEY idx_blessings_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blessing_media (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  blessing_id BIGINT UNSIGNED NOT NULL,
  storage_name VARCHAR(160) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(80) NOT NULL,
  byte_size BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_blessing_media_blessing_id (blessing_id),
  CONSTRAINT fk_blessing_media_blessing
    FOREIGN KEY (blessing_id) REFERENCES blessings (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
