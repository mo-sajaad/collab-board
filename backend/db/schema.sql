-- 1. ENUM
CREATE TYPE task_status AS ENUM ('Not Completed', 'Pending', 'Complete');

-- 2. Users
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tasks
CREATE TABLE tasks (
    task_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    status task_status DEFAULT 'Not Completed',
    priority INTEGER DEFAULT 1,
    creator_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    assignee_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL
);

-- 4. Indexes
CREATE INDEX idx_tasks_creator ON tasks(creator_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);