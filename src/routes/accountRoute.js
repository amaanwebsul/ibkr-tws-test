import express from "express";
import { getAccountSummary, getManagedAccounts } from "../ibkr/account.js";

const router = express.Router();

router.get("/accounts", getManagedAccounts)

router.get("/account-summary", getAccountSummary)

export default router;