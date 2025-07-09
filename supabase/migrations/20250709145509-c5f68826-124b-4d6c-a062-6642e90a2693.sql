-- Add summary column to processes table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'processes' AND column_name = 'summary') THEN
        ALTER TABLE public.processes ADD COLUMN summary text;
    END IF;
END $$;

-- Add display_name column to profiles table if it doesn't exist  
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'display_name') THEN
        ALTER TABLE public.profiles ADD COLUMN display_name text;
    END IF;
END $$;