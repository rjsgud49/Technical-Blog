-- React Structure DB 초기화 (utf8mb4)
CREATE DATABASE IF NOT EXISTS react_structure
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 필요 시 앱 전용 유저 (기본은 root 사용)
-- CREATE USER IF NOT EXISTS 'rs_app'@'localhost' IDENTIFIED BY 'password';
-- GRANT ALL PRIVILEGES ON react_structure.* TO 'rs_app'@'localhost';
-- FLUSH PRIVILEGES;
