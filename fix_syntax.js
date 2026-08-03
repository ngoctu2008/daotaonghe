const fs = require('fs');
const code = fs.readFileSync('/app/gas_project/Code.gs', 'utf8');
try {
  new Function(code);
  console.log("No syntax errors");
} catch(e) {
  // Get line number from error if possible, or just print
  console.log(e.stack);
}
