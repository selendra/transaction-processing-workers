import { defineChain } from "viem";

export const mainnetStr = "https://rpc0.selendra.org";
export const testnetStr = "https://rpc0-testnet.selendra.org";

export const testnet = defineChain({
	id: 1953,
	name: "Selendra Network Testnet",
	nativeCurrency: {
		decimals: 18,
		name: "tSEL",
		symbol: "tSEL",
	},
	rpcUrls: {
		default: {
			http: [
				"https://rpc0-testnet.selendra.org",
				"https://rpc1-testnet.selendra.org",
			],
			webSocket: [
				"wss://rpc0-testnet.selendra.org",
				"wss://rpc1-testnet.selendra.org",
			],
		},
	},
	blockExplorers: {
		default: { name: "Explorer", url: "https://scan.selendra.org" },
	},
});

export const mainnet = defineChain({
	id: 1961,
	name: "Selendra Network Mainnet",
	nativeCurrency: {
		decimals: 18,
		name: "SEL",
		symbol: "SEL",
	},
	rpcUrls: {
		default: {
			http: ["https://rpc0.selendra.org", "https://rpc1.selendra.org"],
			webSocket: ["wss://rpc0.selendra.org", "wss://rpc1.selendra.org"],
		},
	},
	blockExplorers: {
		default: { name: "Explorer", url: "https://scan.selendra.org" },
	},
});
