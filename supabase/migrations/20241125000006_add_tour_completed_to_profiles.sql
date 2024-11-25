-- Add tour_completed column to profiles table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 
                  FROM information_schema.columns 
                  WHERE table_name='profiles' 
                  AND column_name='tour_completed') 
    THEN
        ALTER TABLE profiles ADD COLUMN tour_completed BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Update existing profiles to have tour_completed as false if null
UPDATE profiles SET tour_completed = false WHERE tour_completed IS NULL;
