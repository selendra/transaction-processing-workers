import mongoose from "mongoose";

const ErrorSchema = new mongoose.Schema(
	{
		worker: String,
		opertion: String,
		error: String,
	},
	{
		timestamps: true,
		toJSON: {
			virtuals: true,
		},
	}
);

const ERROR = mongoose.model("ERRORS", ErrorSchema);
