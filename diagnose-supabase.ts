import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("❌ Missing environment variables in .env");
  process.exit(1);
}

console.log(`🔗 Testing connection to: ${url}`);
const supabase = createClient(url, key);

async function runTest() {
  console.log("⏳ Sending test query to 'admin' table...");
  const { data, error } = await supabase.from('admin').select('*').limit(1);
  
  if (error) {
    console.error("❌ Database query failed:", error.message);
  } else {
    console.log("✅ Database query successful! Data received:", data);
  }

  console.log("⏳ Sending auth test (signInWithPassword)...");
  // Don't worry about correct credentials, we just want to see if it responds or hangs
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'password'
  });

  if (authError) {
    console.log("✅ Auth system responded correctly (Error as expected):", authError.message);
  } else {
    console.log("✅ Auth system responded with SUCCESS (unexpected for test account)");
  }
}

runTest();
