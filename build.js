const fs = require('fs');
const path = require('path');

// Đọc biến môi trường từ Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL_HERE';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'YOUR_SUPABASE_ANON_KEY_HERE';

const configContent = `
// Cấu hình tự động sinh ra bởi Vercel Build
const SUPABASE_URL = '${supabaseUrl}';
const SUPABASE_ANON_KEY = '${supabaseKey}';

export { SUPABASE_URL, SUPABASE_ANON_KEY };
`;

fs.writeFileSync(path.join(__dirname, 'config.js'), configContent.trim());

console.log('✅ File config.js đã được tạo thành công từ biến môi trường!');
