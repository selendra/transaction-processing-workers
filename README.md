## Transaction Processor

This project implements a multi-signature wallet system for secure ERC20 token minting.

**Smart Contracts:**

- **MultiSig:** This contract facilitates secure transactions with various roles:
  - **SuperAdmin:** Holds ultimate control over the system.
  - **Submitter:** Initiates minting requests.
  - **Approver:** Validates and approves minting requests.
  - **Executor:** Finalizes valid minting requests by calling the mint function on the ERC20 token contract.
- **ERC20:** One or more ERC20 token contracts are used for minting.

**Node.js Workers:**

The project utilizes separate Node.js programs acting as workers for each role:

- **Submitter:** Submits minting requests to the server.
- **Approver:** Validates and approves/rejects submitted requests.
- **Executor:** Executes approved minting transactions on the ERC20 contract.

**Server:**

The server acts as a central hub for managing transactions:

- Receives new minting transactions.
- Establishes WebSocket connections with workers.
- Assigns tasks to workers based on a predefined ratio (1 submitter, 3 approvers, 1 executor per cluster group).
- Coordinates the workflow (submitter -> approvers -> executor) for each transaction.

**Running the System:**

1. **Server:**
   ```bash
   npm run gateway
   ```
2. **Workers:**
   Set the `PRIVATE_KEY` environment variable with your private key before running each worker script.

   - **Submitter:**
     ```bash
     env PRIVATE_KEY=key npm run submitter
     ```
   - **Approver:**
     ```bash
     env PRIVATE_KEY=key npm run approver
     ```
   - **Executor:**
     ```bash
     env PRIVATE_KEY=key npm run executor
     ```

**Additional Notes:**

- This README provides a basic overview. Refer to the project code for further details.
- Security is paramount. Ensure proper key management practices.
