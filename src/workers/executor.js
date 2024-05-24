import dotenv from "dotenv";
import { initWeb3 } from "../libs/contract.js";
import io from "socket.io-client";

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

	const handleExecute = async (txId, retries = 0) => {
		console.log("executing tx: ", txId);

		try {
			const isTxExecuted = await contract.isTxExecuted(txId);
			if (isTxExecuted) {
				console.log("skip tx already executed: ", txId);
				return socket.emit("executed", { txId, address: wallet.address });
			}

			const hash = await contract.execute(txId, {
				gasLimit: 300000,
			});
			await hash.wait();

			console.log("executed tx: ", txId);
			socket.emit("executed", { txId, address: wallet.address });
		} catch (e) {
			if (retries < 5) {
				return await handleExecute(txId, retries + 1);
			}
		}
	};

	socket.on("connect", async () => {
		console.log("Connect to host");

		socket.emit("room", {
			role: "executor",
			address: wallet.address,
		});
	});

	socket.on("execute", async (data) => {
		const txId = data.txId;
		return await handleExecute(txId, 0);
	});
})();

// Crash prevention
process.on("uncaughtException", (error) => {});
process.on("unhandledRejection", (error) => {});
