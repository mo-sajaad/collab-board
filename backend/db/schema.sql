-- 1. ENUM
CREATE TYPE task_status AS ENUM ('To Do', 'In Progress', 'Done');

-- 2. Users
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
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
    status task_status DEFAULT 'To Do',
    priority INTEGER DEFAULT 1,
    position DOUBLE PRECISION DEFAULT 0,
    creator_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    assignee_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL
);


CREATE TABLE boards (
    board_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    owner_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE board_members (
    id SERIAL PRIMARY KEY,
    board_id INTEGER REFERENCES boards(board_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member', -- owner, member
    UNIQUE(board_id, user_id)
);

ALTER TABLE tasks
ADD COLUMN board_id INTEGER REFERENCES boards(board_id) ON DELETE CASCADE;

-- 4. Indexes
CREATE INDEX idx_tasks_creator ON tasks(creator_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_boards_owner ON boards(owner_id);
CREATE INDEX idx_tasks_board ON tasks(board_id);
CREATE INDEX idx_board_members_user ON board_members(user_id);
CREATE INDEX idx_tasks_board_position ON tasks(board_id, position ASC);