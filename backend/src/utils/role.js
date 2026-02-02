// src/utils/roles.js

const ROLES = {
  JUNIOR: "JUNIOR",
  SENIOR: "SENIOR",
  EXPERT: "EXPERT"
};

function canValidateTask(user) {
  if (!user) return false;
  return user.role === ROLES.EXPERT;
}

module.exports = {
  ROLES,
  canValidateTask
};
