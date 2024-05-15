import { http, getContract, createWalletClient } from "viem";
import { testnet, mainnet } from "./selendra.js";
import { privateKeyToAccount } from "viem/accounts";
import MultiSig from "./MultiSig.json" assert { type: "json" };

export async function init({ isMainNet = false, privateKey, contractAddress }) {
	if (typeof privateKey === "undefined" || typeof privateKey !== "string") {
		throw new Error("Missing ENV PIVATE_KEY");
	}

	if (!privateKey.startsWith("0x")) {
		throw new Error("Invaid private key. Private key must start with 0x");
	}

	if (
		typeof contractAddress === "undefined" ||
		typeof contractAddress !== "string"
	) {
		throw new Error("Missing ENV CONTRACT_ADDRESS");
	}

	const account = privateKeyToAccount(privateKey);
	const client = createWalletClient({
		account,
		chain: isMainNet ? mainnet : testnet,
		transport: http(),
	});

	const contract = getContract({
		address: contractAddress,
		abi: MultiSig.abi,
		client,
	});

	return contract;
}
