import wallets from '../../wallets.json' with { type: "json"};
import {spawn} from 'node:child_process';

(async() => {
  for(const w of wallets.submitters) {
    const subprocess = spawn("node", ['/home/brilliant/projects/baray/transaction-processor/src/workers/submitter.js'], {
      detached: true,
      stdio: 'pipe',
      env: {
        CONTRACT_ADDRESS: "0xD1366153fbc1844DAD583F41810F151E3721D2bD",
        PRIVATE_KEY: w.privateKey,
        GATEWAY: "http://127.0.0.1:6000"
      }
    });
  }

  for(const w of wallets.approvers) {
    const subprocess = spawn("node", ['/home/brilliant/projects/baray/transaction-processor/src/workers/approver.js'], {
      detached: true,
      stdio: 'pipe',
      env: {
        CONTRACT_ADDRESS: "0xD1366153fbc1844DAD583F41810F151E3721D2bD",
        PRIVATE_KEY: w.privateKey,
        GATEWAY: "http://127.0.0.1:6000"
      }
    });
  }

  for(const w of wallets.executors) {
    const subprocess = spawn("node", ['/home/brilliant/projects/baray/transaction-processor/src/workers/executor.js'], {
      detached: true,
      stdio: 'pipe',
      env: {
        CONTRACT_ADDRESS: "0xD1366153fbc1844DAD583F41810F151E3721D2bD",
        PRIVATE_KEY: w.privateKey,
        GATEWAY: "http://127.0.0.1:6000"
      }
    });
  }
})()
