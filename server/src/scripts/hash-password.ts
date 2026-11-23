import { hashPassword } from '../admin/auth';
import { createInterface } from 'node:readline/promises';

const fromArg = process.argv[2];
let pw = fromArg;
if (!pw) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  pw = await rl.question('Admin password (min 10 chars): ');
  rl.close();
}
if (!pw || pw.length < 10) {
  console.error('Password must be at least 10 characters.');
  process.exit(1);
}
console.log(`\nAdd this to your .env:\nADMIN_PASSWORD_HASH=${await hashPassword(pw)}\n`);
