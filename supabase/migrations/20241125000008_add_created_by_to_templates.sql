-- Add created_by column to user_email_templates
ALTER TABLE user_email_templates ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- Update existing templates to set created_by from user_id if it exists
UPDATE user_email_templates 
SET created_by = user_id 
WHERE user_id IS NOT NULL;

-- Add not null constraint after populating data
ALTER TABLE user_email_templates ALTER COLUMN created_by SET NOT NULL;
