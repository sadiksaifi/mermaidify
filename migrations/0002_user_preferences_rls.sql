-- Enable Row Level Security for user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only access their own preferences
CREATE POLICY "users_own_preferences" ON user_preferences
  FOR ALL USING (user_id = auth.uid());
