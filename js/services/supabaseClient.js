/**
 * supabaseClient.js
 * -----------------
 * SINGLE RESPONSIBILITY: Initialize and export the Supabase client.
 * This is the ONLY file that knows the Supabase credentials.
 * 
 * HIGH COHESION: This module does one thing - provide the client.
 * LOW COUPLING: Other services import this client without knowing how it's configured.
 */

const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';       // <-- REPLACE with your Supabase Project URL
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE'; // <-- REPLACE with your Supabase Anon Key

// Import Supabase from CDN (loaded in HTML via <script> tag)
// We use the global `supabase` object provided by the CDN script.
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
