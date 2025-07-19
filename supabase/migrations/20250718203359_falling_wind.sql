/*
  # Create shared reminders table

  1. New Tables
    - `shared_reminders`
      - `id` (uuid, primary key)
      - `reminder_id` (uuid, references reminders.id)
      - `shared_with` (uuid, references profiles.id)
      - `permission` (text, enum: view, edit)
      - `created_at` (timestamp with time zone, default now())

  2. Security
    - Enable RLS on `shared_reminders` table
    - Add policy for users to read shares involving them
    - Add policy for reminder creators to manage shares
*/

CREATE TABLE IF NOT EXISTS shared_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_id uuid REFERENCES reminders(id) ON DELETE CASCADE,
  shared_with uuid REFERENCES profiles(id) ON DELETE CASCADE,
  permission text DEFAULT 'view' CHECK (permission IN ('view', 'edit')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(reminder_id, shared_with)
);

-- Enable RLS
ALTER TABLE shared_reminders ENABLE ROW LEVEL SECURITY;

-- Users can read shares where they are involved
CREATE POLICY "Users can read relevant shares"
  ON shared_reminders
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = shared_with OR
    auth.uid() = (
      SELECT created_by FROM reminders 
      WHERE id = reminder_id
    )
  );

-- Reminder creators can manage shares
CREATE POLICY "Reminder creators can manage shares"
  ON shared_reminders
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = (
      SELECT created_by FROM reminders 
      WHERE id = reminder_id
    )
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_shared_reminders_reminder_id ON shared_reminders(reminder_id);
CREATE INDEX IF NOT EXISTS idx_shared_reminders_shared_with ON shared_reminders(shared_with);