import fs from "fs";
import * as f from "fs/promises";
import path, { dirname } from "path";
import os from "os";
import { Account } from "./types";
import inquirer from "inquirer";
import { buildSsh } from "./ssh";

const DIR = path.join(os.homedir(), ".ssh");
const FILE = path.join(DIR, "accounts", "accounts.json");
const CONFIGFILE = path.join(DIR, "config");

function ensure() {
  if (!fs.existsSync(DIR)) fs.mkdirSync(DIR);
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, "[]");
}

export function loadAccounts(): Account[] {
  ensure();
  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}

export function saveAccounts(newAccounts: Account[]) {
  ensure();

  const existing = loadAccounts();

  const filteredExisting = existing.filter(
    (old) =>
      !newAccounts.some(
        (newAcc) => newAcc.email === old.email && newAcc.host === old.host,
      ),
  );

  const merged = [...filteredExisting, ...newAccounts];

  fs.writeFileSync(FILE, JSON.stringify(merged, null, 2));
}

export function deleteAccount(i: number) {
  ensure();

  const accounts = loadAccounts();

  const account = accounts.at(i - 1);

  if (!account) {
    return;
  }

  let filtered = accounts.filter(
    (acc) => {
      return acc.email != account.email || acc.host != account.host
    },
  );

  fs.writeFileSync(FILE, JSON.stringify(filtered, null, 2));
}

export async function promptStorage() {
  let res = await inquirer.prompt([
    {
      type: "input",
      name: "email",
      message: "Email:",
    },
    {
      type: "input",
      name: "privateKeyPath",
      message: "Store key path:",
    },

    {
      type: "input",
      name: "host",
      message: "Host alias (github-work):",
    },
  ]);
  if (!res.email || !res.privateKeyPath || !res.host) {
    console.error("INVALID INPUT: ");
    console.error({
      email: res.email,
      privateKeyPath: res.privateKeyPath,
      host: res.host,
    });
    return;
  }
  saveAccounts([
    {
      email: res.email,
      privateKeyPath: res.privateKeyPath,
      host: res.host,
    },
  ]);
}

export async function deleteFunc() {
  let res = await inquirer.prompt([
    {
      type: "input",
      name: "i",
      message: "index",
    },
  ]);
  if (res.i === undefined || res.i <= 0) {
    console.error("INVALID INPUT: ");
    console.error({
      index: res.i,
    });
    return;
  }
  deleteAccount(res.i);
}

export async function setFunc() {
  let res = await inquirer.prompt([
    {
      type: "input",
      name: "i",
      message: "index",
    },
  ]);
  if (res.i === undefined || res.i <= 0) {
    console.error("INVALID INPUT: ");
    console.error({
      index: res.i,
    });
    return;
  }
  const accounts = loadAccounts();
  const account = accounts.at(res.i - 1);
  if (!account) {
    console.error("Account not found");
    return;
  }
  await f.mkdir(dirname(CONFIGFILE), { recursive: true });
  let ssh = buildSsh(account);
  await f.writeFile(CONFIGFILE, ssh);
  console.log("SET ACCOUNT SUCCESSFULLY ( " + account.email + " )");
  
}
