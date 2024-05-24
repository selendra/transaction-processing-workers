const MINT = 0;
const ADD_CONTRACT = 1;
const REMOVE_CONTRACT = 2;
const TRANSFER_OWNERSHIP = 3;
const ADD_MEMBER = 4;
const REMOVE_MEMBER = 5;

const OPERATION = {
	MINT,
	ADD_CONTRACT,
	REMOVE_CONTRACT,
	TRANSFER_OWNERSHIP,
	ADD_MEMBER,
	REMOVE_MEMBER,
};

export const getOperation = (opr) => {
	if (typeof opr === "undefined" || typeof opr !== "string") {
		throw new Error("Missing ENV OPERATION");
	}

	if (!opr in OPERATION) {
		throw new Error("Invalid ENV OPERATION");
	}

	return OPERATION[opr];
};
