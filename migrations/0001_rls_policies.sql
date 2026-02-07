-- Enable Row Level Security on all tables
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_versions ENABLE ROW LEVEL SECURITY;

-- Items: users can only access their own
CREATE POLICY "users_own_items" ON items
  FOR ALL USING (user_id = auth.uid());

-- File contents: access through items ownership
CREATE POLICY "users_own_content" ON file_contents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM items WHERE items.id = file_contents.item_id AND items.user_id = auth.uid()
    )
  );

-- File versions: same pattern as file_contents
CREATE POLICY "users_own_versions" ON file_versions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM items WHERE items.id = file_versions.item_id AND items.user_id = auth.uid()
    )
  );
