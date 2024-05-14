import dotenv from "dotenv";
import {
	http,
	getContract,
	createWalletClient,
	createPublicClient,
	fromHex,
} from "viem";
import { selendraTestnet } from "./selendra.js";
import { privateKeyToAccount } from "viem/accounts";
import MultiSig from "./MultiSig.json" assert { type: "json" };

import * as sc from "scale-codec";

dotenv.config();

async function main() {
	const account = privateKeyToAccount(`0x${process.env.SIGNER_1}`);

	const publicClient = createPublicClient({
		chain: selendraTestnet,
		transport: http(),
	});
	const client = createWalletClient({
		account,
		chain: selendraTestnet,
		transport: http(),
	});

	const contract = getContract({
		address: process.env.CONTRACT_MULTI_SIG,
		abi: MultiSig.abi,
		client,
	});

	const filter = await contract.createEventFilter.Submit();
	const unwatch = contract.watchEvent.Submit(
		{},
		{
			onLogs: (logs) => {
				console.log(logs);
				console.log(fromHex(logs[0].args.txId, "string"));
				console.log(sc.decodeHex(logs[0].args.txId).toString());
			},
		}
	);
}

main();
