import express from "express";
import { getAccountSummary, getManagedAccounts } from "../controllers/account.js";

const router = express.Router();

router.get("/get", getManagedAccounts)

router.get("/summary", getAccountSummary)

export default router;