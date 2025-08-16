-- Add submitted_applications column to track which benefits have been submitted
ALTER TABLE application_progress 
ADD COLUMN submitted_applications TEXT[] DEFAULT '{}';
