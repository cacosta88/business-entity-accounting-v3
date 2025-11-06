const fs = require('fs');
const path = require('path');
const solc = require('solc');

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
  output.errors.forEach((err) => {
    console.error(err.formattedMessage);
  });
}

// Check if compilation was successful
if (!output.contracts || !output.contracts['YourContract.sol']) {
  console.error('Compilation failed!');
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

console.log('✓ Contract compiled successfully!');
console.log('Artifacts saved to:', artifactsDir);
