CREATE TABLE orders(
    id SERIAL PRIMARY KEY,
    user_id VARCHAR REFERENCES Users(user_id),
    subscription_id VARCHAR REFERENCES subscriptions(subscription_id),
    transaction_id VARCHAR,
    created_at timestamp,
    status VARCHAR(50)
);