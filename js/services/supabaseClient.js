/**
 * supabaseClient.js
 * -----------------
 * SINGLE RESPONSIBILITY: Initialize and export the Supabase client.
 * This is the ONLY file that knows the Supabase credentials.
 * 
 * HIGH COHESION: This module does one thing - provide the client.
 * LOW COUPLING: Other services import this client without knowing how it's configured.
 */

const SUPABASE_URL = 'https://cuergkhydgyrfmgjeqhn.supabase.co';       // <-- REPLACE with your Supabase Project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1ZXJna2h5ZGd5cmZtZ2plcWhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxOTk5ODQsImV4cCI6MjA4Nzc3NTk4NH0.2EmT_fNwwfZsCSdqyzK3DnHzXYONQc5ry82HofQuwFk'; // <-- REPLACE with your Supabase Anon Key

// Import Supabase from CDN (loaded in HTML via <script> tag)
// We use the global `supabase` object provided by the CDN script.
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
