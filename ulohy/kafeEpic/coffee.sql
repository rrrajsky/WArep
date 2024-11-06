-- Users Table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    coffees INTEGER DEFAULT 0,
    last_coffee TEXT
);

-- Tasks Table
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task TEXT NOT NULL,
    assigned_to INTEGER,
    completed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);
