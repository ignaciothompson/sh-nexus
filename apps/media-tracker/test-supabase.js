const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://uhtdjfxvbgsbowyossug.supabase.co';
const supabaseKey = 'sb_publishable_wMnzwJJN3gAV9FP8NY8ueA_9WPiu_j3';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  // Try to select from seen_history (even if empty, it should not error if table exists)
  const { data, error } = await supabase.from('seen_history').select('*').limit(1);

  if (error) {
    console.error('Connection Failed:', error);
  } else {
    console.log('Connection Successful!');
    console.log('Data:', data);
  }
}

testConnection();
