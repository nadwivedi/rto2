const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/Vahan.jsx', 'utf8');
const lines = content.split(/\r?\n/);

// Find the exact line
const startLine = lines.findIndex(l => l.includes("activeModal === 'Add Permit'"));
if (startLine === -1) {
  console.log("Not found");
  process.exit(1);
}
// Delete the 41 lines
lines.splice(startLine, 41,
  "      {activeModal === 'Add Permit' && (",
  "        <PermitTypeSelectModal onClose={closeModal} openModal={openModal} />",
  "      )}"
);

fs.writeFileSync('frontend/src/pages/Vahan.jsx', lines.join('\n'));
console.log("Success");
