CREATE TABLE categories(
    id SERIAL,
    category_id VARCHAR NOT NULL UNIQUE PRIMARY KEY,
    name VARCHAR NOT NULL
);

CREATE TABLE products(
    id SERIAL,
    product_id VARCHAR NOT NULL UNIQUE PRIMARY KEY,
    name VARCHAR NOT NULL,
    price NUMERIC
);

CREATE TABLE compatible_products(
    id SERIAL PRIMARY KEY,
    product_id VARCHAR NOT NULL REFERENCES products(product_id),
    compatible_id VARCHAR NOT NULL REFERENCES products(product_id),
    category_id VARCHAR NOT NULL REFERENCES categories(category_id)
);

ALTER TABLE compatible_products ADD CONSTRAINT compatible_unique UNIQUE (product_id, compatible_id, category_id);

-- Subscription
CREATE TABLE subscriptions(
    id SERIAL,
    subscription_id VARCHAR NOT NULL UNIQUE PRIMARY KEY,
    name VARCHAR NOT NULL,
    price NUMERIC,
    is_active Boolean default false,
    sort int
);
