import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const base = join(__dirname, '..');

const filesToModify = [
  "app/dashboard/(auth)/finance/page.tsx",
  "app/dashboard/(auth)/logistics/page.tsx",
  "app/dashboard/(auth)/website-analytics/page.tsx",
  "app/dashboard/(auth)/widgets/fitness/page.tsx",
  "app/dashboard/(auth)/real-estate/page.tsx",
  "app/dashboard/(auth)/real-estate/list/page.tsx",
  "app/dashboard/(auth)/real-estate/detail/page.tsx",
  "app/dashboard/(auth)/real-estate/filter/page.tsx",
  "app/dashboard/(auth)/sales/page.tsx",
  "app/dashboard/(auth)/widgets/ecommerce/page.tsx",
  "app/dashboard/(auth)/widgets/analytics/page.tsx",
  "app/dashboard/(auth)/page.tsx",
  "app/dashboard/(auth)/payment/transactions/page.tsx",
  "app/dashboard/(auth)/payment/page.tsx",
  "app/dashboard/(auth)/apps/ai-chat-v2/[id]/page.tsx",
  "app/dashboard/(auth)/apps/ai-chat-v2/page.tsx",
  "app/dashboard/(auth)/apps/file-manager/page.tsx",
  "app/dashboard/(auth)/pages/users/page.tsx",
  "app/dashboard/(auth)/apps/todo-list-app/page.tsx",
  "app/dashboard/(auth)/apps/ai-chat/page.tsx",
  "app/dashboard/(auth)/apps/courses/page.tsx",
  "app/dashboard/(auth)/pages/orders/[id]/page.tsx",
  "app/dashboard/(auth)/apps/text-to-speech/page.tsx",
  "app/dashboard/(auth)/pages/error/403/page.tsx",
  "app/dashboard/(auth)/pages/orders/page.tsx",
  "app/dashboard/(auth)/apps/chat/page.tsx",
  "app/dashboard/(auth)/pages/notifications/page.tsx",
  "app/dashboard/(auth)/pages/onboarding-flow/page.tsx",
  "app/dashboard/(auth)/pages/empty-states/04/page.tsx",
  "app/dashboard/(auth)/pages/empty-states/03/page.tsx",
  "app/dashboard/(auth)/apps/social-media/page.tsx",
  "app/dashboard/(auth)/pages/profile/page.tsx",
  "app/dashboard/(auth)/pages/empty-states/02/page.tsx",
  "app/dashboard/(auth)/apps/calendar/page.tsx",
  "app/dashboard/(auth)/pages/products/[id]/page.tsx",
  "app/dashboard/(auth)/pages/products/page.tsx",
  "app/dashboard/(auth)/pages/empty-states/01/page.tsx",
  "app/dashboard/(auth)/apps/api-keys/page.tsx",
  "app/dashboard/(auth)/pages/products/create/page.tsx",
  "app/dashboard/(auth)/apps/pos-system/tables/page.tsx",
  "app/dashboard/(auth)/apps/ai-image-generator/page.tsx",
  "app/dashboard/(auth)/apps/mail/page.tsx",
  "app/dashboard/(auth)/apps/kanban/page.tsx",
  "app/dashboard/(auth)/apps/pos-system/page.tsx",
  "app/dashboard/(guest)/pages/error/500/page.tsx",
  "app/dashboard/(guest)/pages/error/404/page.tsx",
  "app/dashboard/profile/page.tsx",
  "app/dashboard/(auth)/pages/settings/layout.tsx",
  "app/dashboard/(auth)/pages/settings/page.tsx",
];

function fixContent(content) {
  let result = content;
  
  // Process each quoted string for shadcn references
  // Match strings that contain "shadcn/ui"
  const replacements = [
    // Order matters - most specific first
    [/,\s*shadcn\/ui,\s*react-hook-form,\s*and\s+Zod/g, ', react-hook-form, and Zod'],
    [/,\s*and\s+shadcn\/ui\s+components\./g, ' components.'],
    [/for\s+shadcn\/ui\s+built\s+with\s+React,\s*Tailwind CSS,\s*and\s+TypeScript/g, 'built with React, Tailwind CSS, and TypeScript'],
    [/for\s+shadcn\/ui\s+built\s+with\s+React,\s*TypeScript,\s*Tailwind CSS,\s*and\s+Zod/g, 'built with React, TypeScript, Tailwind CSS, and Zod'],
    [/this\s+shadcn\/ui\s+and\s+Tailwind CSS\s+product page template/g, 'a Tailwind CSS product page template'],
    [/Built\s+with\s+shadcn\/ui,\s*Tailwind CSS,\s*Next\.js\./g, 'Built with Tailwind CSS and Next.js.'],
    [/Built\s+with\s+shadcn\/ui,\s*Tailwind CSS\s+and\s+Next\.js\./g, 'Built with Tailwind CSS and Next.js.'],
    [/Built\s+with\s+shadcn\/ui,\s*Next\.js\s+and\s+Tailwind CSS\./g, 'Built with Next.js and Tailwind CSS.'],
    [/"Orders Page for shadcn\/ui built with React, Tailwind CSS, and TypeScript\./g, '"Orders Page built with React, Tailwind CSS, and TypeScript.'],
    [/"Add Product Page for shadcn\/ui built with React, TypeScript, Tailwind CSS, and Zod\./g, '"Add Product Page built with React, TypeScript, Tailwind CSS, and Zod.'],
    [/,\s*shadcn\/ui,\s*Tailwind CSS,\s*Next\.js\s+and\s+React\./g, ', Tailwind CSS, Next.js and React.'],
    [/,\s*shadcn\/ui,\s*and\s+Tanstack Table\./g, ', and Tanstack Table.'],
    [/,\s*shadcn\/ui,\s*and\s+Tanstack Table for data handling\./g, ', and Tanstack Table for data handling.'],
    [/,\s*and\s+shadcn\/ui\./g, '.'],
    [/\s+and\s+shadcn\/ui\./g, '.'],
    [/,\s*shadcn\/ui,\s*and\s+/g, ', and '],
    [/,\s*TypeScript,\s*Tailwind CSS,\s*and\s+shadcn\/ui\./g, ', TypeScript, and Tailwind CSS.'],
    [/,\s*shadcn\/ui\./g, '.'],
  ];
  
  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement);
  }
  
  return result;
}

let fixedCount = 0;
let unchangedCount = 0;
let skippedCount = 0;

for (const filepath of filesToModify) {
  const fullpath = join(base, filepath.replace(/\//g, '\\'));
  
  if (!existsSync(fullpath)) {
    console.log(`SKIP (not found): ${filepath}`);
    skippedCount++;
    continue;
  }
  
  const content = readFileSync(fullpath, 'utf-8');
  const newContent = fixContent(content);
  
  if (newContent.includes('shadcn/ui')) {
    console.log(`STILL HAS shadcn/ui: ${filepath}`);
    skippedCount++;
    continue;
  }
  
  if (content !== newContent) {
    writeFileSync(fullpath, newContent, 'utf-8');
    console.log(`FIXED: ${filepath}`);
    fixedCount++;
  } else {
    console.log(`NO CHANGE: ${filepath}`);
    unchangedCount++;
  }
}

console.log(`\nDone. Fixed: ${fixedCount}, Unchanged: ${unchangedCount}, Skipped: ${skippedCount}`);