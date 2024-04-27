import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
import * as dotenv from "dotenv";
import * as readline from "readline";
import * as crypto from "crypto";

dotenv.config();

const prisma = new PrismaClient();

const algorithm = "aes-256-cbc";
const key = Buffer.from(process.env.ENCRYPTION_KEY as string, "hex");
const iv = Buffer.from(process.env.ENCRYPTION_IV as string, "hex");

async function main() {
  console.log("Welcome to the confidential data management system.");

  while (true) {
    console.log("\nSelect an option:");
    console.log("1. Insert data");
    console.log("2. Retrieve data");
    console.log("3. Exit");

    const choice = await getUserInput("Enter your choice: ");

    switch (choice) {
      case "1":
        await insertData();
        break;
      case "2":
        await retrieveData();
        break;
      case "3":
        await prisma.$disconnect();
        process.exit(0);
      default:
        console.log("Invalid option. Please try again.");
    }
  }
}

async function insertData() {
  const username = await getUserInput("Enter username: ");
  const phone = await getUserInput("Enter phone number: ");
  const password = await getUserInput("Enter password: ");

  const hashedPassword = await bcrypt.hash(password, 10);

  const encryptedUsername = encrypt(username);
  const encryptedPhone = encrypt(phone);
  const encryptedPassword = encrypt(hashedPassword);

  await prisma.user.create({
    data: {
      username: encryptedUsername,
      phone: encryptedPhone,
      password: encryptedPassword,
    },
  });

  console.log("Data inserted successfully.");
}

async function retrieveData() {
  const adminPassword = await getUserInput("Enter admin password: ");

  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH as string;

  console.log("Authenticating...");

  const isAdminAuthenticated = await bcrypt.compare(
    adminPassword,
    adminPasswordHash
  );

  if (!isAdminAuthenticated) {
    console.log("Authentication failed. Access denied.");
    return;
  }

  console.log("Authentication successful. Access granted.");

  const users = await prisma.user.findMany();

  if (users.length === 0) {
    console.log("No users found.");
    return;
  }

  console.log("User IDs:");
  users.forEach((user) => {
    console.log(user.id);
  });

  const userId = parseInt(await getUserInput("Enter user ID to retrieve: "));

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    console.log("User not found.");
  } else {
    const decryptedUsername = decrypt(user?.username as string);
    const decryptedPhone = decrypt(user?.phone as string);
    const decryptedHashedPassword = decrypt(user?.password as string);

    const decryptedUser = {
      ...user,
      username: decryptedUsername,
      phone: decryptedPhone,
      password: decryptedHashedPassword,
    };

    console.log("Retrieved user:", decryptedUser);
  }
}

function getUserInput(prompt: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(prompt, (input) => {
      rl.close();
      resolve(input.trim());
    });
  });
}

function encrypt(text: string): string {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf-8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

function decrypt(encryptedText: string): string {
  try {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, "hex", "utf-8");
    decrypted += decipher.final("utf-8");
    return decrypted;
  } catch (error) {
    console.log("Error decrypting data: ", error);
    return "";
  }
}

main().catch((error) => {
  console.error("Error: ", error);
  process.exit(1);
});
