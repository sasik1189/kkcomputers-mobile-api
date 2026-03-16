CREATE TABLE categories(
    id SERIAL PRIMARY KEY,
    category_id VARCHAR NOT NULL UNIQUE,
    name VARCHAR NOT NULL
);

CREATE TABLE products(
    id SERIAL PRIMARY KEY,
    product_id VARCHAR NOT NULL UNIQUE,
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
