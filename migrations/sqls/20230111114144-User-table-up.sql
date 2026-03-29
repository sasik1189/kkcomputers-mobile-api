CREATE TABLE Users(
    id SERIAL,
    user_id VARCHAR(50) NOT NULL UNIQUE PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    mobile VARCHAR(50) UNIQUE,
    password VARCHAR(550) NOT NULL,
    shop_name VARCHAR(50)
);

CREATE TABLE Users_token(
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES Users(user_id),
    token VARCHAR NOT NULL,
    device_id VARCHAR,
    device_type VARCHAR,
    created_at timestamp
);

CREATE TABLE otp_temp(
    id SERIAL PRIMARY KEY,
    mobile VARCHAR NOT NULL,
    otp VARCHAR NOT NULL,
    valid_till timestamp
);

CREATE INDEX otp_check_idx ON otp_temp (mobile, otp, valid_till);

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS google_id VARCHAR UNIQUE;
