import { defineChain } from "viem";

export const selendraTestnet = defineChain({
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
