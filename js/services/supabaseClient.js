// This file connect our app to Supabase
// This is the only place with Supabase keys
// Other files use this client easily
// They dont need to know the keys

const SUPABASE_URL = 'https://cuergkhydgyrfmgjeqhn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1ZXJna2h5ZGd5cmZtZ2plcWhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxOTk5ODQsImV4cCI6MjA4Nzc3NTk4NH0.2EmT_fNwwfZsCSdqyzK3DnHzXYONQc5ry82HofQuwFk';


// We use the Supabase library from the CDN
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
