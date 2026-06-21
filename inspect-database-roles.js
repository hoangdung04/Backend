import sequelize from "./config/database.js";
import Role from "./models/role.model.js";
import Account from "./models/account.model.js";

async function inspect() {
  try {
    await sequelize.authenticate();
    const roles = await Role.findAll({ raw: true });
    console.log("=== ROLES IN DATABASE ===");
    console.log(roles);

    const accounts = await Account.findAll({ raw: true, attributes: ["id", "fullName", "email", "roleId", "status", "deleted"] });
    console.log("=== ACCOUNTS IN DATABASE ===");
    console.log(accounts);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

inspect();
