import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { signal, effect } from "@preact/signals-core";
import { createJob, getPendingJobs, updateJob } from "./job";
dotenv.config();

const PORT = process.env.PORT;
const DB_URI = process.env.DB_URI;

const app = express();
app.use(express.json());

const initial = signal(true);
const jobs = signal([]);

async function add_job({ txId }) {
	try {
		const created = await createJob({ txId });
		if (created) {
			jobs.value = [...jobs.value, created];
		}
	} catch (error) {
		throw error;
	}
}

async function update_job({ txId, status }) {
	try {
		const updated = await updateJob({ txId, status });
		if (updated) {
			if (status === "submitted") {
				jobs.value = jobs.value.filter((job) => job.txId !== txId);
			}
		}
	} catch (error) {
		throw error;
	}
}

effect(() => {
	if (initial.value) {
		getPendingJobs().then((data) => {
			jobs.value = data;
			initial.value = false;
		});
	}
});

effect(() => {
	if (!initial.value) {
		console.log("Jobs initialized");
	}
});

app.post("/submit", async (req, res) => {
	try {
		const txId = req.body.txId;
		await add_job({ txId });

		res.json({
			status: "SUCCESS",
			message: "Task added to queue",
		});
	} catch (error) {
		res.status(400).json({
			status: "ERROR",
			message: error.message,
		});
	}
});

app.post("/update", async (req, res) => {
	try {
		const txId = req.body.txId;
		const status = req.body.status;

		await update_job({ txId, status });
		res.json({
			status: "SUCCESS",
			message: "Task status updated",
		});
	} catch (error) {
		res.status(400).json({
			status: "ERROR",
			message: error.message,
		});
	}
});

mongoose.connect(DB_URI).then(() => {
	console.log("CONNECTED TO DB");
	app.listen(PORT, () => {
		console.log("SUBMITTER SERVER: ", PORT);
	});
});
