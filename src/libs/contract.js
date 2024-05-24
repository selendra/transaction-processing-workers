import { mainnetStr, testnetStr } from "./selendra.js";
import MultiSig from "../../MultiSig.json" with { type: "json" };
import { ethers } from "ethers";

export async function initWeb3({ isMainNet = false, privateKey, contractAddress }) {
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

	const network = new ethers.JsonRpcProvider(isMainNet ? mainnetStr : testnetStr)
	const wallet = new ethers.Wallet(privateKey, network);
	const contract = new ethers.Contract(contractAddress, MultiSig.abi, wallet);

	return { 
		network,
		wallet,
		contract,
	};
}
