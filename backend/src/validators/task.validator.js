const { z } = require("zod");

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(["GREEN", "ORANGE", "RED"]),
  createdBy: z.string().uuid().optional(),
  assignedTo: z.string().uuid().nullable().optional(),
});
const updateStatusSchema = z.object({
  status: z.enum(["TODO", "DONE"]),
});

module.exports = { createTaskSchema };
