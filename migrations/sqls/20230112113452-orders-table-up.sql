CREATE TABLE orders(
    id SERIAL,
    order_id VARCHAR not null PRIMARY KEY,
    razorpay_order_id VARCHAR not null,
    user_id VARCHAR REFERENCES Users(user_id),
    subscription_id VARCHAR REFERENCES subscriptions(subscription_id),
    payment_id VARCHAR,
    created_at timestamp,
    payment_received_at timestamp,
    signature VARCHAR,
    status VARCHAR(50)
);