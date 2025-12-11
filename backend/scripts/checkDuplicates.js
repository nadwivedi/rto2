const fs = require('fs');
const path = require('path');

const partAPath = path.join(__dirname, '../data/national_permits_part_a.json');
const data = JSON.parse(fs.readFileSync(partAPath, 'utf-8'));

const seen = new Map();
const duplicates = [];

data.forEach((record, index) => {
  const key = `${record.permitNumber}_${record.vehicleNumber}`;

  if (seen.has(key)) {
    const firstIndex = seen.get(key);
    duplicates.push({
      permitNumber: record.permitNumber,
      vehicleNumber: record.vehicleNumber,
      permitHolder: record.permitHolder,
      firstOccurrence: firstIndex,
      secondOccurrence: index
    });
  } else {
    seen.set(key, index);
  }
});

console.log('Total records in Part A JSON:', data.length);
console.log('Unique permits:', seen.size);
console.log('Duplicates found:', duplicates.length);

if (duplicates.length > 0) {
  console.log('\n' + '='.repeat(60));
  console.log('DUPLICATE RECORDS:');
  console.log('='.repeat(60));
  duplicates.forEach(d => {
    console.log(`\nPermit: ${d.permitNumber}`);
    console.log(`Vehicle: ${d.vehicleNumber}`);
    console.log(`Holder: ${d.permitHolder}`);
    console.log(`Appears at index: ${d.firstOccurrence} and ${d.secondOccurrence}`);
  });
}
