const taskRepo = require("../repositories/task.repository");
const auditRepo = require("../repositories/audit.repository");
const { createTaskSchema } = require("../validators/task.validator");
const { updateStatusSchema } = require("../validators/task.validator");

async function createTask(req, res) {
  try {
    createTaskSchema.parse(req.body);

    const createdBy = req.user.id;

    const task = await taskRepo.createTask({
      ...req.body,
      createdBy,          // ✅ camelCase attendu par repo
      assignedTo: null,   // ✅ MVP: pas d’assign auto
    });

    await auditRepo.logAudit({
      action: "CREATE_TASK",
      entity: "TASK",
      entityId: task.id,
      actorId: createdBy, // ✅ l’acteur = celui qui a créé
    });

    return res.status(201).json(task);
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({ error: "INVALID_INPUT", details: err.errors });
    }
    console.error(err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}


async function listTasks(req, res) {
  try {
    const tasks = await taskRepo.getTasks();
    return res.json(tasks);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}
async function updateTaskStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = updateStatusSchema.parse(req.body);

    const updated = await taskRepo.updateTaskStatus({ id, status });
    if (!updated) return res.status(404).json({ error: "TASK_NOT_FOUND" });

    await auditRepo.logAudit({
      action: "UPDATE_TASK_STATUS",
      entity: "TASK",
      entityId: updated.id,
      actorId: req.user.id,
    });

    return res.json(updated);
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({ error: "INVALID_INPUT", details: err.errors });
    }
    console.error(err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}

module.exports = { createTask, listTasks, updateTaskStatus };