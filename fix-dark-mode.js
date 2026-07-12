const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src/app/dashboard/page.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// Function to safely replace a tailwind class by ensuring it's not already preceded by "dark:"
function addDark(cls, darkCls) {
  // Regex looks for whitespace/quote/backtick, then the class, then whitespace/quote/backtick
  // using a replacer function to check if it's already part of a "dark:" class
  const regex = new RegExp(`(?<!dark:)\\b${cls}\\b`, 'g');
  content = content.replace(regex, `${cls} ${darkCls}`);
}

addDark('bg-white', 'dark:bg-zinc-900');
addDark('bg-zinc-100', 'dark:bg-zinc-950');
addDark('bg-zinc-50', 'dark:bg-zinc-900/50');
addDark('bg-zinc-900', 'dark:bg-zinc-100'); // the button
addDark('text-zinc-900', 'dark:text-zinc-100');
addDark('text-zinc-800', 'dark:text-zinc-200');
addDark('text-zinc-700', 'dark:text-zinc-300');
addDark('text-zinc-600', 'dark:text-zinc-400');
addDark('text-zinc-500', 'dark:text-zinc-400');
addDark('text-zinc-400', 'dark:text-zinc-500');
addDark('text-zinc-300', 'dark:text-zinc-600');
addDark('text-white', 'dark:text-zinc-900'); // for buttons
addDark('border-zinc-200', 'dark:border-zinc-800');
addDark('border-zinc-100', 'dark:border-zinc-800');
addDark('hover:bg-zinc-100', 'dark:hover:bg-zinc-800');
addDark('hover:bg-zinc-800', 'dark:hover:bg-zinc-200'); // for the dark button
addDark('hover:text-zinc-900', 'dark:hover:text-white');

fs.writeFileSync(targetFile, content, 'utf8');
console.log("Updated dashboard/page.tsx for dark mode");
