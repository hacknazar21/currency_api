create TABLE currency(
    id SERIAL PRIMARY KEY,
    buy FLOAT(2),
    sell FLOAT(2),
    currency VARCHAR(255),
    bank VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = current_timestamp;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER currency_updated_at_trigger
BEFORE UPDATE ON currency
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
