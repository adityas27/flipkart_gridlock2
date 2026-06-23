import { db } from "../lib/prisma.js";

async function main() {
  console.log("Prisma keys:", Object.keys(db));
}

main().catch(console.error);
