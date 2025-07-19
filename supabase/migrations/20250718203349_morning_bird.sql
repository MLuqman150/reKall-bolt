/*
  # Create reminders table

  1. New Tables
    - `reminders`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `description` (text, optional)
      - `scheduled_at` (timestamp with time zone, required)
      - `created_by` (uuid, references profiles.id)
      - `assigned_to` (uuid, references profiles.id, nullable)
      - `media_attachments` (jsonb, array of media objects)
      - `status` (text, enum: pending, completed, cancelled)
      - `recurring_pattern` (text, nullable)
      - `is_recurring` (boolean, default false)
      - `created_at` (timestamp with time zone, default now())
      - `updated_at` (timestamp with time zone, default now())

  2. Security
    - Enable RLS on `reminders` table
    - Add policy for users to read reminders they created or are assigned to
    - Add policy for users to update reminders they created
    - Add policy for users to insert new reminders
*/

CREATE TABLE IF NOT EXISTS reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  scheduled_at timestamptz NOT NULL,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
  media_attachments jsonb DEFAULT '[]',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  recurring_pattern text,
  is_recurring boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Users can read reminders they created or are assigned to
CREATE POLICY "Users can read own or assigned reminders"
  ON reminders
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = created_by OR 
    auth.uid() = assigned_to OR
    id IN (
      SELECT reminder_id FROM shared_reminders 
      WHERE shared_with = auth.uid()
    )
  );

-- Users can update reminders they created
CREATE POLICY "Users can update own reminders"
  ON reminders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Users can insert new reminders
CREATE POLICY "Users can insert reminders"
  ON reminders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Users can delete their own reminders
CREATE POLICY "Users can delete own reminders"
  ON reminders
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_reminders_updated_at
  BEFORE UPDATE ON reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();