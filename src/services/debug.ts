// Debug utility to check environment variables with obfuscated tokens
const obfuscateToken = (token: string | undefined): string => {
  if (!token) return 'undefined';
  if (token.length <= 8) return '***';
  return `${token.substring(0, 4)}...${token.substring(token.length - 4)}`;
};

export const debugEnv = () => {
  console.log('=== ENVIRONMENT DEBUG ===');
  console.log('NODE_ENV:', import.meta.env.MODE);
  console.log('DEV:', import.meta.env.DEV);
  console.log('PROD:', import.meta.env.PROD);
  console.log('');
  console.log('=== STORYBLOK TOKENS ===');
  console.log('VITE_STORYBLOK_TOKEN exists:', !!import.meta.env.VITE_STORYBLOK_TOKEN);
  console.log('VITE_STORYBLOK_TOKEN value:', obfuscateToken(import.meta.env.VITE_STORYBLOK_TOKEN));
  console.log('VITE_STORYBLOK_MANAGEMENT_TOKEN exists:', !!import.meta.env.VITE_STORYBLOK_MANAGEMENT_TOKEN);
  console.log('VITE_STORYBLOK_MANAGEMENT_TOKEN value:', obfuscateToken(import.meta.env.VITE_STORYBLOK_MANAGEMENT_TOKEN));
  console.log('VITE_STORYBLOK_SPACE_ID exists:', !!import.meta.env.VITE_STORYBLOK_SPACE_ID);
  console.log('VITE_STORYBLOK_SPACE_ID value:', import.meta.env.VITE_STORYBLOK_SPACE_ID);
  console.log('');
  console.log('=== AI SERVICE TOKENS ===');
  console.log('VITE_MISTRAL_API_KEY exists:', !!import.meta.env.VITE_MISTRAL_API_KEY);
  console.log('VITE_MISTRAL_API_KEY value:', obfuscateToken(import.meta.env.VITE_MISTRAL_API_KEY));
  console.log('VITE_FAL_API_KEY exists:', !!import.meta.env.VITE_FAL_API_KEY);
  console.log('VITE_FAL_API_KEY value:', obfuscateToken(import.meta.env.VITE_FAL_API_KEY));
  console.log('VITE_ELEVENLABS_API_KEY exists:', !!import.meta.env.VITE_ELEVENLABS_API_KEY);
  console.log('VITE_ELEVENLABS_API_KEY value:', obfuscateToken(import.meta.env.VITE_ELEVENLABS_API_KEY));
  console.log('========================');
};