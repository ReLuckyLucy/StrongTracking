CREATE TABLE IF NOT EXISTS users (
    id UUID NOT NULL,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (id),
    UNIQUE (username),
    UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS ix_users_username ON users (username);
CREATE INDEX IF NOT EXISTS ix_users_email ON users (email);

CREATE TABLE IF NOT EXISTS exercises (
    id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    user_id UUID,
    PRIMARY KEY (id),
    CONSTRAINT fk_exercises_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS ix_exercises_user_id ON exercises (user_id);

CREATE TABLE IF NOT EXISTS workouts (
    id UUID NOT NULL,
    user_id UUID NOT NULL,
    date DATE NOT NULL,
    notes TEXT,
    duration_minutes INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (id),
    CONSTRAINT fk_workouts_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS ix_workouts_user_id ON workouts (user_id);
CREATE INDEX IF NOT EXISTS ix_workouts_date ON workouts (date);

CREATE TABLE IF NOT EXISTS workout_sets (
    id UUID NOT NULL,
    workout_id UUID NOT NULL,
    exercise_id UUID NOT NULL,
    set_number INTEGER NOT NULL,
    weight_kg FLOAT NOT NULL,
    reps INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (id),
    CONSTRAINT fk_workout_sets_workout_id FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
    CONSTRAINT fk_workout_sets_exercise_id FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS ix_workout_sets_workout_id ON workout_sets (workout_id);
CREATE INDEX IF NOT EXISTS ix_workout_sets_exercise_id ON workout_sets (exercise_id);
