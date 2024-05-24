import io from "socket.io-client";
import dotenv from "dotenv";
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

	const handleSubmit = async (txId, retries = 0) => {
		console.log("submitting tx: ", txId);

		try {
			const userId = "0xa5915AAAF9ABCE06764eBa224A3A3F208fCD91f5";
			const amount = "1000000000000000000";
			const tokenId = "USD";

			const isTxSubmitted = await contract.isTxSubmitted(txId);
			if (isTxSubmitted) {
				console.log("skip tx already submitted:", txId);
				return socket.emit("submitted", { txId, address: wallet.address });
			}

			const hash = await contract.mint(txId, userId, amount, tokenId, {
				gasLimit: 300000,
			});
			await hash.wait();

			console.log("submitted tx:", txId);
			socket.emit("submitted", { txId, address: wallet.address });
		} catch (e) {
			if (retries < 5) {
				return await handleSubmit(txId, retries + 1);
			}
		}
	};

	socket.on("connect", () => {
		console.log("Connect to host");
		socket.emit("room", {
			role: "submitter",
			address: wallet.address,
		});
	});

	socket.on("submit", async (data) => {
		const txId = data.txId;
		return await handleSubmit(txId, 0);
	});
})();

// Crash prevention
process.on("uncaughtException", (error) => {});
process.on("unhandledRejection", (error) => {});
