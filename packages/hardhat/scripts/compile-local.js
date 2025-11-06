/**
 * Local Solidity Compiler Script
 * 
 * This script compiles the YourContract.sol using the locally installed solc compiler.
 * It's a workaround for environments where access to binaries.soliditylang.org is restricted.
 * 
 * Usage: node scripts/compile-local.js
 * 
 * The script:
 * 1. Reads the contract source code
 * 2. Compiles it using the local solc package
 * 3. Generates Hardhat-compatible artifacts
 * 4. Saves them to the artifacts directory
 */

const fs = require('fs');
const path = require('path');
const solc = require('solc');

console.log('Starting local compilation...');
console.log('Solc version:', solc.version());

// Read the contract
const contractPath = path.resolve(__dirname, '../contracts/YourContract.sol');
const source = fs.readFileSync(contractPath, 'utf8');

// Prepare the input for the compiler
const input = {
  language: 'Solidity',
  sources: {
    'YourContract.sol': {
      content: source,
    },
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
    outputSelection: {
      '*': {
        '*': ['*'],
      },
    },
  },
};

// Compile
console.log('Compiling contract...');
const output = JSON.parse(solc.compile(JSON.stringify(input)));

// Check for errors
if (output.errors) {
  let hasErrors = false;
  output.errors.forEach((err) => {
    if (err.severity === 'error') {
      hasErrors = true;
      console.error('ERROR:', err.formattedMessage);
    } else {
      console.warn('WARNING:', err.formattedMessage);
    }
  });
  
  if (hasErrors) {
    console.error('\n❌ Compilation failed with errors!');
    process.exit(1);
  }
}

// Check if compilation was successful
if (!output.contracts || !output.contracts['YourContract.sol']) {
  console.error('❌ Compilation failed - no output generated!');
  process.exit(1);
}

// Create artifacts directory
const artifactsDir = path.resolve(__dirname, '../artifacts/contracts');
fs.mkdirSync(artifactsDir, { recursive: true });

// Save the compiled contract
const contract = output.contracts['YourContract.sol']['YourContract'];
const artifact = {
  _format: 'hh-sol-artifact-1',
  contractName: 'YourContract',
  sourceName: 'contracts/YourContract.sol',
  abi: contract.abi,
  bytecode: '0x' + contract.evm.bytecode.object,
  deployedBytecode: '0x' + contract.evm.deployedBytecode.object,
  linkReferences: contract.evm.bytecode.linkReferences,
  deployedLinkReferences: contract.evm.deployedBytecode.linkReferences,
};

const contractDir = path.resolve(artifactsDir, 'YourContract.sol');
fs.mkdirSync(contractDir, { recursive: true });

fs.writeFileSync(
  path.resolve(contractDir, 'YourContract.json'),
  JSON.stringify(artifact, null, 2)
);

console.log('✅ Contract compiled successfully!');
console.log('📁 Artifacts saved to:', artifactsDir);
console.log('\nNext steps:');
console.log('1. Generate TypeScript types: npx typechain --target ethers-v5 --out-dir typechain-types "./artifacts/contracts/**/*.json"');
console.log('2. Run tests: npx hardhat test --no-compile --network hardhat');

