// Test script to verify the LL Eligible for DL filter logic
// Run this with: node test-date-filter.js

const today = new Date()
today.setHours(0, 0, 0, 0)

const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000))

console.log('=== Date Filter Test ===')
console.log('Today (normalized):', today.toISOString())
console.log('Thirty Days Ago:', thirtyDaysAgo.toISOString())
console.log('')

// Test cases
const testCases = [
  {
    name: 'Test User 1 - Should be ELIGIBLE',
    llIssueDate: new Date(today.getTime() - (35 * 24 * 60 * 60 * 1000)), // 35 days ago
    llExpiryDate: new Date(today.getTime() + (150 * 24 * 60 * 60 * 1000)), // 150 days from now
  },
  {
    name: 'Test User 2 - Should be ELIGIBLE (exactly 30 days)',
    llIssueDate: new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000)), // exactly 30 days ago
    llExpiryDate: new Date(today.getTime() + (150 * 24 * 60 * 60 * 1000)), // 150 days from now
  },
  {
    name: 'Test User 3 - NOT eligible (only 29 days)',
    llIssueDate: new Date(today.getTime() - (29 * 24 * 60 * 60 * 1000)), // 29 days ago
    llExpiryDate: new Date(today.getTime() + (150 * 24 * 60 * 60 * 1000)), // 150 days from now
  },
  {
    name: 'Test User 4 - NOT eligible (LL expired)',
    llIssueDate: new Date(today.getTime() - (200 * 24 * 60 * 60 * 1000)), // 200 days ago
    llExpiryDate: new Date(today.getTime() - (10 * 24 * 60 * 60 * 1000)), // expired 10 days ago
  },
  {
    name: 'Test User 5 - Should be ELIGIBLE (60 days old)',
    llIssueDate: new Date(today.getTime() - (60 * 24 * 60 * 60 * 1000)), // 60 days ago
    llExpiryDate: new Date(today.getTime() + (100 * 24 * 60 * 60 * 1000)), // 100 days from now
  },
]

console.log('Testing filter logic:')
console.log('')

testCases.forEach((testCase, index) => {
  const issueDate = testCase.llIssueDate
  const expiryDate = testCase.llExpiryDate

  // Check if LL is not expired
  const isNotExpired = expiryDate >= today

  // Check if LL has completed 30 days
  const daysSinceIssue = Math.floor((today - issueDate) / (1000 * 60 * 60 * 24))
  const hasCompleted30Days = daysSinceIssue >= 30

  // Backend logic: Issue date <= thirtyDaysAgo
  const backendMatch = issueDate <= thirtyDaysAgo && expiryDate >= today

  const isEligible = isNotExpired && hasCompleted30Days

  console.log(`${index + 1}. ${testCase.name}`)
  console.log(`   LL Issue Date: ${issueDate.toISOString().split('T')[0]}`)
  console.log(`   LL Expiry Date: ${expiryDate.toISOString().split('T')[0]}`)
  console.log(`   Days since issue: ${daysSinceIssue}`)
  console.log(`   Is not expired: ${isNotExpired}`)
  console.log(`   Has completed 30 days: ${hasCompleted30Days}`)
  console.log(`   Backend match: ${backendMatch}`)
  console.log(`   Frontend match: ${isEligible}`)
  console.log(`   → RESULT: ${isEligible ? '✓ ELIGIBLE' : '✗ NOT ELIGIBLE'}`)
  console.log('')
})

console.log('=== Summary ===')
console.log('Expected eligible: Test User 1, Test User 2, Test User 5')
console.log('Expected NOT eligible: Test User 3, Test User 4')
