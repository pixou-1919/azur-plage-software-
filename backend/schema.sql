-- Hotel Reservation Dashboard — PostgreSQL schema

CREATE TABLE staff (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'receptionist', -- 'receptionist' | 'admin'
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    number VARCHAR(10) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL,          -- 'single' | 'double' | 'suite' etc.
    price_per_night NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'available', -- 'available' | 'occupied' | 'maintenance'
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE guests (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(30),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES rooms(id),
    guest_id INTEGER NOT NULL REFERENCES guests(id),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'confirmed', -- 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled'
    created_by INTEGER REFERENCES staff(id),
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT valid_dates CHECK (check_out > check_in)
);

-- Prevents double-booking the same room for overlapping dates
CREATE INDEX idx_bookings_room_dates ON bookings(room_id, check_in, check_out);
