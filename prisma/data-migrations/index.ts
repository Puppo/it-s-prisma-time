import { PrismaClient } from "@prisma/client";
import child_process from "child_process";
import fs from "fs/promises";
import path from "path";
import utils from "util";

const exec = utils.promisify(child_process.exec);

type DataMigrationType = "seed" | "fixture";
function isDataMigration(type: unknown): type is DataMigrationType {
  return type === "seed" || type === "fixture";
}

const getExecutedDataMigrations = async (type: DataMigrationType) => {
  const client = new PrismaClient();
  try {
    const migrations = await client.dataMigrations.findMany({
      where: {
        type,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        name: true,
      },
    });
    return migrations.map(s => s.name);
  } catch (ex) {
    console.error(`Error on retrieve data migration of type ${type}`, ex);
    throw ex;
  } finally {
    await client.$disconnect();
  }
};

const registerDataMigrationExecute = async (
  name: string,
  type: DataMigrationType
) => {
  const client = new PrismaClient();
  try {
    await client.dataMigrations.create({
      data: {
        name,
        type,
      },
    });
  } catch (ex) {
    console.error(`Error on register data migration ${name}`, ex);
    throw ex;
  } finally {
    await client.$disconnect();
  }
};

const executeDataMigration = async (
  dataMigrationAction: () => Promise<void>
) => {
  const client = new PrismaClient();
  try {
    await client.$transaction(async () => {
      await dataMigrationAction();
    });
  } finally {
    await client.$disconnect();
  }
};

const run = async (type: DataMigrationType) => {
  console.log(`Running ${type}`);

  const executedMigration = await getExecutedDataMigrations(type);

  const scriptFolder = path.join(__dirname, `${type}s`);

  const files = await fs.readdir(scriptFolder);
  files.sort();
  for (const file of files) {
    if (executedMigration.some(m => m === file)) {
      console.log(`${type} ${file} already executed`);
      continue;
    }
    const fileFullPath = path.join(scriptFolder, file);
    try {
      executeDataMigration(async () => {
        console.log(`${type} ${fileFullPath} start`);
        await exec(`ts-node ${fileFullPath}`);
        console.log(`${type} ${fileFullPath} ran successfully`);
        await registerDataMigrationExecute(file, type);
        console.log(`${type} ${fileFullPath} registered successfully`);
      });
    } catch (e) {
      console.error(`${type} ${fileFullPath} error`, e);
      throw e;
    }
  }
};

const argv = process.argv.slice(2);
const type = argv[0];
if (!isDataMigration(type)) {
  console.error(`Invalid type ${type}`);
  process.exit(1);
}
run(type);
