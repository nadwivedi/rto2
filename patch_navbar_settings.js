const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'frontend/src/components/Navbar.jsx');
let content = fs.readFileSync(file, 'utf8');

// The lines currently read:
// !['Forms', 'setting', 'whatsapp'].includes(item.name) && !['/setting', '/forms', '/whatsapp'].includes(item.path)
// I will just replace them blindly to remove 'setting' and '/setting'

content = content.replace(
  /!\['Forms', 'setting', 'whatsapp'\]\.includes\(item\.name\) && !\['\/setting', '\/forms', '\/whatsapp'\]\.includes\(item\.path\)/g,
  "!['Forms', 'whatsapp'].includes(item.name) && !['/forms', '/whatsapp'].includes(item.path)"
);

// We also need to fix desktopMenuItems which had:
// item.path !== "/" && item.path !== "/forms" && item.path !== "/setting" && item.path !== "/noc" && item.path !== "/whatsapp"
// But settings should not be hidden in desktopMenuItems either for staff, or generally. Wait, desktopMenuItems actually hides settings globally! 
// "Desktop menu items (all except Dashboard, Forms and Settings)"
// It was globally hidden anyway `item.path !== "/setting"`
// So staff hiding just impacted Mobile Menu and Dropdown.

fs.writeFileSync(file, content, 'utf8');
console.log('Navbar Settings unhidden correctly.');
