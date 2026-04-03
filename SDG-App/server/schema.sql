-- SDG App Database Schema
-- Supports SQLite (dev) and MySQL/PostgreSQL (prod)

CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          VARCHAR(100)  NOT NULL,
    email         VARCHAR(255)  NOT NULL UNIQUE,
    password_hash VARCHAR(255)  NOT NULL,
    role          VARCHAR(20)   NOT NULL DEFAULT 'student', -- 'student' | 'coordinator'
    description   TEXT,
    course_code   VARCHAR(50),
    avatar_url    TEXT,
    created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sdgs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    number      INTEGER      NOT NULL UNIQUE, -- 1-17
    title       VARCHAR(255) NOT NULL,
    description TEXT         NOT NULL,
    icon        VARCHAR(255),
    color       VARCHAR(50),
    example     TEXT
);

CREATE TABLE IF NOT EXISTS quiz_questions (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    sdg_number    INTEGER      NOT NULL REFERENCES sdgs(number),
    question_text TEXT         NOT NULL,
    option_a      VARCHAR(500) NOT NULL,
    option_b      VARCHAR(500) NOT NULL,
    option_c      VARCHAR(500) NOT NULL,
    option_d      VARCHAR(500) NOT NULL,
    correct_option CHAR(1)     NOT NULL, -- 'a' | 'b' | 'c' | 'd'
    explanation   TEXT,
    fun_facts     TEXT
);

CREATE TABLE IF NOT EXISTS quiz_results (
    id           INTEGER  PRIMARY KEY AUTOINCREMENT,
    user_id      INTEGER  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score        INTEGER  NOT NULL,
    total        INTEGER  NOT NULL,
    answers_json TEXT,    -- JSON: array of {question_id, chosen, correct}
    submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS card_sort_results (
    id                INTEGER  PRIMARY KEY AUTOINCREMENT,
    user_id           INTEGER  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    most_relevant     TEXT,    -- JSON array of SDG numbers
    somewhat_relevant TEXT,    -- JSON array of SDG numbers
    least_relevant    TEXT,    -- JSON array of SDG numbers
    saved_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reflections (
    id                  INTEGER  PRIMARY KEY AUTOINCREMENT,
    user_id             INTEGER  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title               VARCHAR(255) NOT NULL,
    type                VARCHAR(100),
    sdg_numbers         TEXT,    -- JSON array of SDG numbers
    reflection_text     TEXT     NOT NULL,
    employer_discussion BOOLEAN  NOT NULL DEFAULT 0,
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_progress (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id            INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    viewed_sdg_cards   TEXT,   -- JSON array of SDG numbers viewed
    completed_card_sort BOOLEAN NOT NULL DEFAULT 0,
    completed_quiz     BOOLEAN NOT NULL DEFAULT 0,
    reflection_count   INTEGER NOT NULL DEFAULT 0,
    viewed_resources   TEXT    -- JSON array of resource identifiers viewed
);

CREATE TABLE IF NOT EXISTS discussion_posts (
    id          INTEGER  PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    author_name VARCHAR(100) NOT NULL,
    title       VARCHAR(255) NOT NULL,
    body        TEXT         NOT NULL,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS discussion_comments (
    id          INTEGER  PRIMARY KEY AUTOINCREMENT,
    post_id     INTEGER  NOT NULL REFERENCES discussion_posts(id) ON DELETE CASCADE,
    user_id     INTEGER  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    author_name VARCHAR(100) NOT NULL,
    body        TEXT         NOT NULL,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);
