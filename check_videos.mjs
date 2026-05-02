import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://slirphzzwcogdbkeicff.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsaXJwaHp6d2NvZ2Ria2VpY2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDUzMzgsImV4cCI6MjA4NTAyMTMzOH0.44uwdZZxQZYmmHr9yUALGO4Vr6mJVaVfSQW_pzJ0uoI'
);

const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
  email: 'chhorngkimlain1@gmail.com',
  password: 'Chhorng@1903'
});

if (authError) { console.log('Auth error:', authError.message); process.exit(1); }
console.log('Signed in as:', authData.user.email);

const { data: stores, error: storeError } = await supabase
  .from('store_profiles')
  .select('id, name, slug')
  .ilike('name', '%mommy%');

console.log('Stores:', JSON.stringify(stores, null, 2));
if (storeError) console.log('Store error:', storeError.message);

if (stores && stores.length > 0) {
  const storeId = stores[0].id;
  const { data: posts, error: postsError } = await supabase
    .from('store_posts')
    .select('id, media_urls, media_type, created_at, is_published')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });
  
  console.log('\nPosts:', JSON.stringify(posts, null, 2));
  if (postsError) console.log('Posts error:', postsError.message);
  
  // Check what the URLs look like when normalized
  if (posts) {
    for (const post of posts) {
      console.log('\n--- Post', post.id, '---');
      for (const url of (post.media_urls || [])) {
        console.log('Raw URL:', url);
        // Check if URL is a full URL
        const isFullUrl = /^https?:\/\//i.test(url);
        const normalized = isFullUrl ? url : `https://slirphzzwcogdbkeicff.supabase.co/storage/v1/object/public/store-posts/${url.replace(/^\/+/, '').replace(/^storage\/v1\/object\/public\/store-posts\//, '').replace(/^store-posts\//, '')}`;
        console.log('Normalized URL:', normalized);
      }
    }
  }
}
