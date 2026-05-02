const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://slirphzzwcogdbkeicff.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsaXJwaHp6d2NvZ2Ria2VpY2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDUzMzgsImV4cCI6MjA4NTAyMTMzOH0.44uwdZZxQZYmmHr9yUALGO4Vr6mJVaVfSQW_pzJ0uoI'
);

async function main() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'chhorngkimlain1@gmail.com',
    password: 'Chhorng@1903'
  });
  
  if (authError) { console.log('Auth error:', authError.message); return; }
  console.log('Signed in as:', authData.user.email);
  
  // Find Mommy Seafood store profile
  const { data: stores, error: storeError } = await supabase
    .from('store_profiles')
    .select('id, name, slug')
    .ilike('name', '%mommy%');
  
  console.log('Stores:', JSON.stringify(stores, null, 2));
  if (storeError) console.log('Store error:', storeError.message);
  
  if (stores && stores.length > 0) {
    const storeId = stores[0].id;
    // Get posts for this store
    const { data: posts, error: postsError } = await supabase
      .from('store_posts')
      .select('id, media_urls, media_type, created_at, is_published')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });
    
    console.log('Posts:', JSON.stringify(posts, null, 2));
    if (postsError) console.log('Posts error:', postsError.message);
  }
}

main().catch(console.error);
