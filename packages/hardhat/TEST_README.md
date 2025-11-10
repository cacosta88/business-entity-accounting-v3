# Business Entity Accounting - Test Suite

This document describes the comprehensive test suite for the YourContract smart contract.

## Running Tests

Due to network restrictions in some environments, we use a custom compilation process:

```bash
# 1. Compile the contract using local solc
node scripts/compile-local.js

# 2. Generate TypeScript types
npx typechain --target ethers-v5 --out-dir typechain-types './artifacts/contracts/**/*.json'

# 3. Run the tests (skip compilation since we already compiled)
npx hardhat test --no-compile --network hardhat
```

Or simply:
```bash
yarn test
```

## Test Coverage

The test suite includes **27 comprehensive tests** covering:

### Deployment (3 tests)
- Verify correct initial owners
- Verify capital requirements
- Verify starting period

### Capital Management (4 tests)
- Capital deposit functionality
- Incorrect deposit amount rejection
- Non-owner deposit rejection
- Capital adjustment proposals

### Expense Management (3 tests)
- Expense proposal creation
- Voting on expense proposals
- Majority vote approval mechanism

### Invoice Management (3 tests)
- Invoice issuance
- Invoice payment
- Incorrect payment amount rejection

### Accounting Period Management (3 tests)
- Period close proposal mechanism
- Profit distribution to owners
- Period increment after closing

### View Functions (3 tests)
- Ownership percentage calculation
- Gross receipts and total expenses retrieval
- Capital array retrieval

### Batch Capital Increase (3 tests)
- Batch proposal creation
- Batch proposal voting
- Batch deposit after approval

### Edge Cases and Security (5 tests)
- Double voting prevention
- Unapproved expense settlement rejection
- Double invoice payment prevention
- Zero withdrawal rejection
- Invoice payment tracking

## Key Features Tested

1. **Multi-signature governance**: Requires >50% ownership vote for major decisions
2. **Accrual accounting**: Expenses recognized when incurred, revenue when earned
3. **Capital management**: Safe deposit and adjustment mechanisms
4. **Invoice system**: Create, pay, and track invoices
5. **Profit distribution**: Automatic calculation and distribution based on ownership
6. **Security**: Protection against double voting, unauthorized actions, and reentrancy

## Test Structure

Each test suite:
1. Sets up initial state in `beforeEach` hooks
2. Tests positive scenarios (expected behavior)
3. Tests negative scenarios (rejection of invalid inputs)
4. Verifies event emissions where appropriate
5. Checks state changes and balances

## Notes

- Tests use the Hardhat network for fast, deterministic execution
- All monetary values use ethers.utils.parseEther for proper wei conversion
- Custom errors are tested using `.revertedWithCustomError()`
- Event emissions are verified with `.to.emit()` assertions
