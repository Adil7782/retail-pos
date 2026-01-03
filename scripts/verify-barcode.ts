import { parseBarcode } from '../lib/barcode';

const testCases = [
    {
        name: 'Valid Weighted Item (1.250kg)',
        input: '2100502012508',
        expected: {
            isWeighted: true,
            scalePlu: '00502',
            weight: 1.25,
            originalCode: '2100502012508'
        }
    },
    {
        name: 'Valid Weighted Item (12 Digits - Missing Checksum)',
        input: '210050201250',
        expected: {
            isWeighted: true,
            scalePlu: '00502',
            weight: 1.25,
            originalCode: '210050201250'
        }
    },
    {
        name: 'Valid Weighted Item (0.050kg)',
        input: '2199999000509',
        expected: {
            isWeighted: true,
            scalePlu: '99999',
            weight: 0.05,
            originalCode: '2199999000509'
        }
    },
    {
        name: 'Invalid Prefix (Standard EAN-13)',
        input: '1234567890123',
        expected: {
            isWeighted: false,
            originalCode: '1234567890123'
        }
    },
    {
        name: 'Invalid Length (Too Short)',
        input: '2100502',
        expected: {
            isWeighted: false,
            originalCode: '2100502'
        }
    },
    {
        name: 'Invalid Length (Too Long)',
        input: '21005020125089',
        expected: {
            isWeighted: false,
            originalCode: '21005020125089'
        }
    },
    {
        name: 'Not Numeric',
        input: '210050201250a',
        expected: {
            isWeighted: false,
            originalCode: '210050201250a'
        }
    }
];

console.log('--- Running Barcode Parser Tests ---\n');

let passed = 0;
let failed = 0;

for (const test of testCases) {
    const result = parseBarcode(test.input);
    const success = JSON.stringify(result) === JSON.stringify(test.expected);

    if (success) {
        console.log(`✅ ${test.name}: PASS`);
        passed++;
    } else {
        console.log(`❌ ${test.name}: FAIL`);
        console.log(`   Input: ${test.input}`);
        console.log(`   Expected:`, test.expected);
        console.log(`   Actual:`, result);
        failed++;
    }
}

console.log(`\n--- Summary ---`);
console.log(`Total: ${testCases.length}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed > 0) process.exit(1);
