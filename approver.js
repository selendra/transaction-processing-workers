import dotenv from "dotenv";
import { init } from "./contract.js";
import { getOperation } from "./operation.js";
dotenv.config();

async function main() {
	const contract = await init({
		contractAddress: process.env.CONTRACT_ADDRESS,
		privateKey: process.env.PRIVATE_KEY,
		isMainNet: false,
	});
	const opr = getOperation(process.env.OPERATION);

	contract.watchEvent.Submit(
		{},
		{
			onLogs: (logs) => {
				const to_approves = logs
					.filter(
						(log) => "args" in log && "opr" in log.args && log.args.opr === opr
					)
					.map((log) => log.args);

				console.log(to_approves);
			},
		}
	);
}

main();

process.on("uncaughtException", (error) => {
	console.log(error);
});

process.on("unhandledRejection", (error) => {
	console.log(error);
});
