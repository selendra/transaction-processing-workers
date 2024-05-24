import mongoose from "mongoose";

const jobStatuses = ["queued", "submitted", "approved", "executed"];

const JobSchema = new mongoose.Schema(
	{
		txId: {
			type: String,
			unique: true,
			required: true,
		},
		status: {
			type: String,
			required: true,
			enum: jobStatuses,
			default: "queued",
		},
		txHash: {
			type: String,
		},
	},
	{
		timestamps: true,
		toJSON: {
			virtuals: true,
		},
	}
);

export const JOB = mongoose.model("JOBS", JobSchema);

export async function createJob({ txId }) {
	const existed = await JOB.findOne({ txId });
	if (existed) {
		throw new Error("Transaction already submitted");
	}

	return await new JOB({ txId }).save();
}

export async function updateJob({ txId, status }) {
	const job = await JOB.findOne({ txId });

	if (!job) {
		throw new Error("Transaction was not submitted");
	}

	if (!jobStatuses.includes(status)) {
		throw new Error("Invalid status");
	}

	return await JOB.findOneAndUpdate({ txId }, { status });
}

export async function getPendingQueueJobs() {
	const results = await JOB.find({ status: "queued" });
	return results.map((res) => res.toObject());
}

export async function getPendingSubmittedJobs() {
	const results = await JOB.find({ status: "submitted" });
	return results.map((res) => res.toObject());
}

export async function getPendingApprovedJobs() {
	const results = await JOB.find({ status: "approved" });
	return results.map((res) => res.toObject());
}
