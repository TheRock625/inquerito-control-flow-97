-- Enhanced security for handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate input data
  IF NEW.id IS NULL THEN
    RAISE EXCEPTION 'User ID cannot be null';
  END IF;
  
  -- Validate email format if provided
  IF NEW.email IS NOT NULL AND NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  -- Create profile with validation
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NULL)
  );
  
  -- Log the profile creation for security auditing
  RAISE LOG 'Profile created for user: %', NEW.id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error and re-raise
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add display_name column to profiles if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'display_name') THEN
        ALTER TABLE public.profiles ADD COLUMN display_name TEXT;
    END IF;
END $$;

-- Add summary column to processes if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'processes' AND column_name = 'summary') THEN
        ALTER TABLE public.processes ADD COLUMN summary TEXT;
    END IF;
END $$;

-- Add validation function for process data
CREATE OR REPLACE FUNCTION public.validate_process_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate required fields
  IF NEW.number IS NULL OR LENGTH(TRIM(NEW.number)) = 0 THEN
    RAISE EXCEPTION 'Process number is required';
  END IF;
  
  IF NEW.type NOT IN ('IP', 'TC', 'PAAI') THEN
    RAISE EXCEPTION 'Invalid process type';
  END IF;
  
  -- Sanitize text fields
  NEW.number := TRIM(NEW.number);
  NEW.type := TRIM(NEW.type);
  NEW.status := TRIM(NEW.status);
  NEW.forwarding := TRIM(NEW.forwarding);
  
  IF NEW.summary IS NOT NULL THEN
    NEW.summary := TRIM(NEW.summary);
    -- Limit summary length
    IF LENGTH(NEW.summary) > 1000 THEN
      RAISE EXCEPTION 'Summary too long (max 1000 characters)';
    END IF;
  END IF;
  
  -- Validate pending_actions if it's an array
  IF NEW.pending_actions IS NOT NULL THEN
    -- Limit number of pending actions
    IF jsonb_array_length(NEW.pending_actions) > 20 THEN
      RAISE EXCEPTION 'Too many pending actions (max 20)';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for process validation
DROP TRIGGER IF EXISTS validate_process_trigger ON public.processes;
CREATE TRIGGER validate_process_trigger
  BEFORE INSERT OR UPDATE ON public.processes
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_process_data();

-- Add validation function for profile data
CREATE OR REPLACE FUNCTION public.validate_profile_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate display_name if provided
  IF NEW.display_name IS NOT NULL THEN
    NEW.display_name := TRIM(NEW.display_name);
    
    IF LENGTH(NEW.display_name) < 2 THEN
      RAISE EXCEPTION 'Display name too short (min 2 characters)';
    END IF;
    
    IF LENGTH(NEW.display_name) > 100 THEN
      RAISE EXCEPTION 'Display name too long (max 100 characters)';
    END IF;
    
    -- Allow only letters, spaces, and common diacritics
    IF NEW.display_name !~ '^[a-zA-ZÀ-ÿ\s]+$' THEN
      RAISE EXCEPTION 'Display name contains invalid characters';
    END IF;
  END IF;
  
  -- Validate email if provided
  IF NEW.email IS NOT NULL AND NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for profile validation
DROP TRIGGER IF EXISTS validate_profile_trigger ON public.profiles;
CREATE TRIGGER validate_profile_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_profile_data();