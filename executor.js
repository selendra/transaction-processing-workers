import dotenv from "dotenv";
import { getOperation } from "./operation.js";
import { init } from "./contract.js";
dotenv.config();

async function main() {
	const contract = await init({
		contractAddress: process.env.CONTRACT_ADDRESS,
		privateKey: process.env.PRIVATE_KEY,
		isMainNet: false,
	});
	const opr = getOperation(process.env.OPERATION);
	contract.watchEvent.Approve(
		{},
		{
			onLogs: (logs) => {
				const to_executes = logs
					.filter(
						(log) => "args" in log && "opr" in log.args && log.args.opr === opr
					)
					.map((log) => log.args);

				console.log(to_executes);
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
