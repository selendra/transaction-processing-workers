import dotenv from "dotenv";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import { signal, effect, computed } from "@preact/signals-core";
import {
	createJob,
	getPendingApprovedJobs,
	getPendingQueueJobs,
	getPendingSubmittedJobs,
	updateJob,
} from "./models/job.js";

dotenv.config();
const PORT = process.env.PORT;
const DB_URI = process.env.DB_URI;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: "*",
	},
});

app.use(express.json());

const initial = signal(true);
const finished = signal(0);

const jobsToSubmit = signal([]);
const jobsToApprove = signal([]);
const jobsToExecute = signal([]);

const submitProcesses = signal([]);
const approveProcesses = signal([]);
const executeProcesses = signal([]);

const completedSumissions = signal(0);
const completedApprovals = signal(0);
const completedExecutions = signal(0);

const workers = signal([]);
const submitters = signal([]);
const approvers = signal([]);
const executors = signal([]);

const freeSubmitters = computed(() => {
	// filter workers that is not listed in any processes
	const filter = (submitter) => {
		return !submitProcesses.value.some((process) => {
			return process.workers.some((e) => {
				return e.address === submitter.address;
			});
		});
	};

	return submitters.value.filter(filter);
});

const freeApprovers = computed(() => {
	// filter workers that is not listed in any processes
	const filter = (approver) => {
		return !approveProcesses.value.some((process) => {
			return process.workers.some((e) => {
				return e.address === approver.address;
			});
		});
	};

	return approvers.value.filter(filter);
});

const freeExecutors = computed(() => {
	// filter workers that is not listed in any processes
	const filter = (executor) => {
		return !executeProcesses.value.some((process) => {
			return process.workers.some((e) => {
				return e.address === executor.address;
			});
		});
	};

	return executors.value.filter(filter);
});

const hasJobsToSubmit = computed(() => {
	return jobsToSubmit.value.length > 0 && freeSubmitters.value.length > 0;
});

const hasJobsToApprove = computed(() => {
	return jobsToApprove.value.length > 0 && freeApprovers.value.length > 2;
});

const hasJobsToExecute = computed(() => {
	return jobsToExecute.value.length > 0 && freeExecutors.value.length > 0;
});

const approvedJobs = computed(() => {
	return approveProcesses.value.filter((p) => {
		console.log("workers", p.workers);
		const sent = p.sent;
		const sum = p.workers.reduce((sum, current) => sum + current.done, 0);
		console.log("sent", sent);
		console.log("sum", sum);

		return sent && sum === 3;
	});
});

function addFollower(socketId) {
	console.log("CONNECTED: ", socketId);
	workers.value = [...workers.value, socketId];
}

function removeFollower(socketId) {
	console.log("DISCONNECTED: ", socketId);
	workers.value = workers.value.filter((f) => f !== socketId);
	submitters.value = submitters.value.filter((f) => f !== socketId);
	approvers.value = approvers.value.filter((f) => f !== socketId);
	executors.value = executors.value.filter((f) => f !== socketId);
}

effect(() => {
	if (initial.value) {
		getPendingQueueJobs().then((data) => {
			jobsToSubmit.value = data;
		});

		getPendingSubmittedJobs().then((data) => {
			jobsToApprove.value = data;
		});

		getPendingApprovedJobs().then((data) => {
			jobsToExecute.value = data;
		});

		initial.value = false;
	}
});

// Info logs
effect(() => {
	console.clear();
	console.log("LOOP DETECTOR: ", Date.now());

	console.log("\nWORKERS INFO");
	console.log("SERVER: ", "0.0.0.0");
	console.log("PORT: ", PORT);
	console.log("INITIALIZED: ", !initial.value);

	console.log("\nWORKERS INFO");
	console.log("WORKERS: ", workers.value.length);
	console.log("SUBMITTERS: ", submitters.value.length);
	console.log("APPROVERS: ", approvers.value.length);
	console.log("EXECUTORS: ", executors.value.length);

	console.log("\nSUBMISSION PROCESS");
	console.log("WAITING: ", jobsToSubmit.value.length);
	console.log("COMPLETED: ", completedSumissions.value);
	console.log("PROCESSING: ", submitProcesses.value.length);
	console.log(
		"PROCESSES: ",
		submitProcesses.value.map((p) => p.txId)
	);

	console.log("\nAPPROVAL PROCESS");
	console.log("WAITING: ", jobsToApprove.value.length);
	console.log("COMPLETED: ", completedApprovals.value);
	console.log("PROCESSING: ", approveProcesses.value.length);
	console.log(
		"PROCESSES: ",
		approveProcesses.value.map((p) => p.txId)
	);

	console.log("\nEXECUTION PROCESS");
	console.log("WAITING: ", jobsToExecute.value.length);
	console.log("COMPLETED: ", completedExecutions.value);
	console.log("PROCESSING: ", executeProcesses.value.length);
	console.log(
		"PROCESSES: ",
		executeProcesses.value.map((p) => p.txId)
	);
});

effect(() => {
	if (hasJobsToSubmit.value) {
		const firstJob = jobsToSubmit.value.at(0);
		const remainingJobs = jobsToSubmit.value.filter(
			(job) => job.txId != firstJob.txId
		);
		const firstWorker = freeSubmitters.value.at(0);

		jobsToSubmit.value = remainingJobs;
		submitProcesses.value = [
			...submitProcesses.value,
			{
				...firstJob,
				workers: [
					{
						address: firstWorker.address,
						done: 0,
					},
				],
				sent: false,
			},
		];
	}
});

effect(() => {
	if (hasJobsToApprove.value) {
		const firstJob = jobsToApprove.value.at(0);
		const remainingJobs = jobsToApprove.value.filter(
			(job) => job.txId != firstJob.txId
		);
		const firstWorker = freeApprovers.value.at(0);
		const secondWorker = freeApprovers.value.at(1);
		const thirdWorker = freeApprovers.value.at(2);

		console.log(hasJobsToApprove.value);
		console.log(firstWorker);
		console.log(secondWorker);
		console.log(thirdWorker);

		jobsToApprove.value = remainingJobs;
		approveProcesses.value = [
			...approveProcesses.value,
			{
				...firstJob,
				workers: [
					{ address: firstWorker.address, done: 0 },
					{ address: secondWorker.address, done: 0 },
					{ address: thirdWorker.address, done: 0 },
				],
				sent: false,
			},
		];
	}
});

effect(() => {
	if (hasJobsToExecute.value) {
		const firstJob = jobsToExecute.value.at(0);
		const remainingJobs = jobsToExecute.value.filter(
			(job) => job.txId != firstJob.txId
		);
		const firstWorker = freeExecutors.value.at(0);
		jobsToExecute.value = remainingJobs;
		executeProcesses.value = [
			...approveProcesses.value,
			{
				...firstJob,
				workers: [{ address: firstWorker.address, done: 0 }],
				sent: false,
			},
		];
	}
});

effect(() => {
	submitProcesses.value.forEach((p) => {
		const _workers = workers.value
			.filter((w) => p.workers.includes(w.address))
			.map((p) => p.address);
		io.to(_workers).emit("submit", p);
	});
});

effect(() => {
	approveProcesses.value.forEach((p, index) => {
		if (!p.sent) {
			const _workers = workers.value
				.filter((w) => p.workers.includes(w.address))
				.map((p) => p.address);
			const update = approveProcesses.value;
			update[index].sent = true;
			approveProcesses.value = update;
			io.to(_workers).emit("approve", p);
		}
	});
});

effect(async () => {
	console.log("approvedJobs.value", approvedJobs.value);
	const done = approvedJobs.value.map((p) => p.txId);
	if (done.length > 0) {
		console.log("done", done);
		approveProcesses.value = approveProcesses.value.filter(
			(p) => !done.includes(p.txId)
		);
		const toExecs = done.map((d) => ({ txId: d }));
		console.log("toExecs", toExecs);
		// approved
		for (const t of toExecs) {
			await updateJob({ txId: t.txId, status: "approved" });
		}
		jobsToExecute.value = [...jobsToExecute.value, ...toExecs];
	}
});

effect(() => {
	executeProcesses.value.forEach((p) => {
		const _workers = workers.value
			.filter((w) => p.workers.includes(w.address))
			.map((p) => p.address);
		io.to(_workers).emit("execute", p);
	});
});

io.on("connection", (socket) => {
	// add workers
	addFollower(socket.id);

	// group workers to rooms
	socket.on("room", ({ role, address }) => {
		if (role === "submitter") {
			const data = submitters.value.filter((s) => {
				return s.address !== address;
			});
			submitters.value = [
				...data,
				{
					role,
					address,
					socketId: socket.id,
				},
			];
		}

		if (role === "approver") {
			const data = approvers.value.filter((s) => {
				return s.address !== address;
			});
			approvers.value = [
				...data,
				{
					role,
					address,
					socketId: socket.id,
				},
			];
		}

		if (role === "executor") {
			const data = executors.value.filter((s) => {
				return s.address !== address;
			});

			executors.value = [
				...data,
				{
					role,
					address,
					socketId: socket.id,
				},
			];
		}
	});

	socket.on("submitted", ({ txId }) => {
		jobsToApprove.value = [...jobsToApprove.value, { txId }];
		submitProcesses.value = submitProcesses.value.filter(
			(sp) => sp.txId !== txId
		);
		completedSumissions.value = completedSumissions.value + 1;
		updateJob({ txId, status: "submitted" }).then((res) => {});
	});

	socket.on("approved", ({ txId, address }) => {
		const update = approveProcesses.value.map((p) => {
			if (p.txId === txId) {
				const w = p.workers.map((_w) => {
					if (_w.address === address) {
						_w.done = 1;
					}
					return _w;
				});
				p.workers = w;
			}
			return p;
		});
		console.log("update", JSON.stringify(update, null, 4));
		approveProcesses.value = update;
		completedApprovals.value = completedApprovals.value + 1;
	});

	socket.on("executed", ({ txId }) => {
		executeProcesses.value = executeProcesses.value.filter(
			(p) => p.txId !== txId
		);
		completedExecutions.value = completedExecutions.value + 1;
		finished.value = finished.value + 1;
		updateJob({ txId, status: "executed" }).then((res) => {});
	});

	socket.on("disconnect", () => {
		removeFollower(socket.id);
	});
});

app.post("/submit", async (req, res) => {
	try {
		const txId = req.body.txId;
		const created = await createJob({ txId });
		if (created) {
			jobsToSubmit.value = [...jobsToSubmit.value, created.toObject()];
		}

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

mongoose.connect(DB_URI).then(() => {
	console.log("CONNECTED TO DB");
	server.listen(PORT, "0.0.0.0", () => {
		console.log("SUBMITTER SERVER: ", PORT);
	});
});
