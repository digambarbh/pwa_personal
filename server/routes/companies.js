import { Router } from "express";
import Company from "../models/Company.js";

const router = Router();

router.get("/", async (req, res) => {
  const companies = await Company.find().sort({ createdAt: -1 }).lean();
  res.json(companies);
});

router.post("/", async (req, res) => {
  const { name, role, status, appliedDate, notes } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: "Company name is required" });

  const company = await Company.create({
    name: name.trim(),
    role: role?.trim() || "",
    status: status || "applied",
    appliedDate: appliedDate || null,
    notes: notes || "",
  });
  res.status(201).json(company);
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, role, status, appliedDate, notes } = req.body;

  const company = await Company.findById(id);
  if (!company) return res.status(404).json({ error: "Company not found" });

  if (name !== undefined) company.name = name;
  if (role !== undefined) company.role = role;
  if (status !== undefined) company.status = status;
  if (appliedDate !== undefined) company.appliedDate = appliedDate;
  if (notes !== undefined) company.notes = notes;

  await company.save();
  res.json(company);
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const result = await Company.findByIdAndDelete(id);
  if (!result) return res.status(404).json({ error: "Company not found" });
  res.json({ ok: true });
});

export default router;
