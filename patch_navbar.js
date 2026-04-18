const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'frontend/src/components/Navbar.jsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace('import { getTheme } from "../context/ThemeContext";', 'import { getTheme } from "../context/ThemeContext";\r\nimport { useAuth } from "../context/AuthContext";');

content = content.replace('const Navbar = () => {', 'const Navbar = () => {\r\n  const { user } = useAuth();');

content = content.replace(
  'const desktopMenuItems = menuItems.filter(',
  `// Filter out restricted items for staff
  let filteredMenuItems = menuItems;
  let filteredDropdownItems = dropdownItems;
  
  if (user?.type === 'staff') {
    filteredMenuItems = menuItems.filter(item => 
      !['Forms', 'setting', 'whatsapp'].includes(item.name) && !['/setting', '/forms', '/whatsapp'].includes(item.path)
    );
    filteredDropdownItems = dropdownItems.filter(item => 
      !['Forms', 'setting', 'whatsapp'].includes(item.name) && !['/setting', '/forms', '/whatsapp'].includes(item.path)
    );
  }

  // Desktop menu items (all except Dashboard, Forms and Settings)
  const desktopMenuItems = filteredMenuItems.filter(`
);

content = content.replace(
  '{menuItems.map((item) => (',
  '{filteredMenuItems.map((item) => ('
);

content = content.replace(
  '{dropdownItems.map((item) => (',
  '{filteredDropdownItems.map((item) => ('
);

fs.writeFileSync(file, content, 'utf8');
console.log('Navbar updated successfully.');
