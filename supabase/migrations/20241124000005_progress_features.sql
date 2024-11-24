-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    job_title TEXT NOT NULL,
    company TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('applied', 'interview', 'offer', 'rejected', 'withdrawn')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    level INTEGER NOT NULL DEFAULT 1,
    total_points INTEGER NOT NULL DEFAULT 0,
    applications_submitted INTEGER NOT NULL DEFAULT 0,
    interviews_attended INTEGER NOT NULL DEFAULT 0,
    offers_received INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    referred_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'joined', 'placed')),
    reward_points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create skill_suggestions table
CREATE TABLE IF NOT EXISTS skill_suggestions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    relevance FLOAT NOT NULL CHECK (relevance >= 0 AND relevance <= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create RLS policies
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_suggestions ENABLE ROW LEVEL SECURITY;

-- Applications policies
CREATE POLICY "Users can view their own applications"
    ON applications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own applications"
    ON applications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications"
    ON applications FOR UPDATE
    USING (auth.uid() = user_id);

-- Achievements policies
CREATE POLICY "Users can view their own achievements"
    ON achievements FOR SELECT
    USING (auth.uid() = user_id);

-- User progress policies
CREATE POLICY "Users can view their own progress"
    ON user_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
    ON user_progress FOR UPDATE
    USING (auth.uid() = user_id);

-- Referrals policies
CREATE POLICY "Users can view their referrals"
    ON referrals FOR SELECT
    USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);

CREATE POLICY "Users can create referrals"
    ON referrals FOR INSERT
    WITH CHECK (auth.uid() = referrer_id);

-- Skill suggestions policies
CREATE POLICY "Users can view their skill suggestions"
    ON skill_suggestions FOR SELECT
    USING (auth.uid() = user_id);

-- Functions for gamification
CREATE OR REPLACE FUNCTION update_user_achievements()
RETURNS TRIGGER AS $$
BEGIN
    -- Check for first application achievement
    IF (SELECT COUNT(*) FROM applications WHERE user_id = NEW.user_id) = 1 THEN
        INSERT INTO achievements (user_id, title, description, points)
        VALUES (NEW.user_id, 'First Application', 'Submitted your first job application', 100);
    END IF;

    -- Check for first interview achievement
    IF NEW.status = 'interview' AND 
       (SELECT COUNT(*) FROM applications WHERE user_id = NEW.user_id AND status = 'interview') = 1 THEN
        INSERT INTO achievements (user_id, title, description, points)
        VALUES (NEW.user_id, 'Interview Ready', 'Got your first interview invitation', 200);
    END IF;

    -- Check for first offer achievement
    IF NEW.status = 'offer' AND 
       (SELECT COUNT(*) FROM applications WHERE user_id = NEW.user_id AND status = 'offer') = 1 THEN
        INSERT INTO achievements (user_id, title, description, points)
        VALUES (NEW.user_id, 'Offer Received', 'Received your first job offer', 500);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER application_achievements_trigger
    AFTER INSERT OR UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_user_achievements();

-- Function to update user progress
CREATE OR REPLACE FUNCTION update_user_progress()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_progress (user_id, applications_submitted, interviews_attended, offers_received)
    VALUES (
        NEW.user_id,
        (SELECT COUNT(*) FROM applications WHERE user_id = NEW.user_id),
        (SELECT COUNT(*) FROM applications WHERE user_id = NEW.user_id AND status = 'interview'),
        (SELECT COUNT(*) FROM applications WHERE user_id = NEW.user_id AND status = 'offer')
    )
    ON CONFLICT (user_id) DO UPDATE
    SET 
        applications_submitted = (SELECT COUNT(*) FROM applications WHERE user_id = NEW.user_id),
        interviews_attended = (SELECT COUNT(*) FROM applications WHERE user_id = NEW.user_id AND status = 'interview'),
        offers_received = (SELECT COUNT(*) FROM applications WHERE user_id = NEW.user_id AND status = 'offer'),
        total_points = (SELECT COALESCE(SUM(points), 0) FROM achievements WHERE user_id = NEW.user_id),
        level = GREATEST(1, FLOOR(POWER((SELECT COALESCE(SUM(points), 0) FROM achievements WHERE user_id = NEW.user_id) / 100, 0.4))),
        updated_at = TIMEZONE('utc', NOW());
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_progress_trigger
    AFTER INSERT OR UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_user_progress();
