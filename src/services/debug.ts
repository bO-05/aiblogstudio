// Debug utility to check environment variables
export const debugEnv = () => {
  console.log('=== ENVIRONMENT DEBUG ===');
  console.log('NODE_ENV:', import.meta.env.MODE);
  console.log('DEV:', import.meta.env.DEV);
  console.log('PROD:', import.meta.env.PROD);
  console.log('');
  console.log('=== STORYBLOK TOKENS ===');
  console.log('VITE_STORYBLOK_TOKEN exists:', !!import.meta.env.VITE_STORYBLOK_TOKEN);
  console.log('VITE_STORYBLOK_TOKEN value:', import.meta.env.VITE_STORYBLOK_TOKEN);
  console.log('VITE_STORYBLOK_MANAGEMENT_TOKEN exists:', !!import.meta.env.VITE_STORYBLOK_MANAGEMENT_TOKEN);
  console.log('VITE_STORYBLOK_SPACE_ID exists:', !!import.meta.env.VITE_STORYBLOK_SPACE_ID);
  console.log('VITE_STORYBLOK_SPACE_ID value:', import.meta.env.VITE_STORYBLOK_SPACE_ID);
  console.log('');
  console.log('=== ALL VITE ENV VARS ===');
  console.log(import.meta.env);
  console.log('========================');
};