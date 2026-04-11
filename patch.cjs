const fs = require('fs');
const content = fs.readFileSync('src/app/App.tsx', 'utf8');
const start = content.indexOf('    const fetchAll = async () => {');
const end = content.indexOf('          try { \r\n            window.localStorage');
console.log('start', start, 'end', end);

