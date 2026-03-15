CREATE TABLE Users(
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    mobile VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(550) NOT NULL,
    shop_name VARCHAR(50) NOT NULL
);

CREATE TABLE Users_token(
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES Users(user_id),
    token VARCHAR NOT NULL,
    device_id VARCHAR,
    device_type VARCHAR,
    created_at timestamp
);

