import dotenv from "dotenv";
import io from "socket.io-client";
import { initWeb3 } from "../libs/contract.js";

dotenv.config();

(async () => {
	// Must connect to chain first
	const { contract, wallet } = await initWeb3({
		contractAddress: process.env.CONTRACT_ADDRESS,
		privateKey: process.env.PRIVATE_KEY,
		isMainNet: false,
	});

	// Then join socket after connected to chain
	const socket = io(process.env.GATEWAY);

	const handleApprove = async (txId, retries = 0) => {
		console.log("approving tx: ", txId);

		try {
			const isTxApproved = await contract.isTxApproved(txId);
			if (isTxApproved) {
				console.log("skip tx already approved: ", txId);
				return socket.emit("approved", { txId, address: wallet.address });
			}

			const hash = await contract.approve(txId, {
				gasLimit: 300000,
			});

			const tx = await hash.wait();

			console.log("approved tx: ", txId);
			socket.emit("approved", { txId, address: wallet.address });
		} catch (e) {
			if (retries < 5) {
				return await handleApprove(txId, retries + 1);
			}
		}
	};

	socket.on("connect", async () => {
		console.log("Connect to host");

		socket.emit("room", {
			role: "approver",
			address: wallet.address,
		});
	});

	socket.on("approve", async (data) => {
		const txId = data.txId;
		return await handleApprove(txId, 0);
	});
})();

// Crash prevention
process.on("uncaughtException", (error) => {});
process.on("unhandledRejection", (error) => {});
