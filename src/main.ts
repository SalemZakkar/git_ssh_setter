import inquirer from "inquirer";
import { deleteFunc, loadAccounts, promptStorage, setFunc } from "./storage";
import { Account } from "./types";
import { log } from "node:console";

export async function prompt() {
  let answer = await inquirer.prompt([
    {
      type: "input",
      name: "op",
      message: "operation (store , delete , list , set):",
    },
  ]);
  if (!["store", "delete", "list", "set"].includes(answer?.op)) {
    console.log("invalid operation");
    return;
  }
  if (answer?.op == "store") {
    await promptStorage();
  }
  if (answer?.op == "delete") {
    await deleteFunc();
  }
  if (answer?.op == "list") {
    let res = await loadAccounts();
    prettyPrint(res);
  }
  if (answer?.op == "set") {
    await setFunc();
  }
}

function prettyPrint(accounts: Account[]) {
  for (let i = 0; i < accounts.length; i++) {
    console.log(
      (i + 1).toString() + " " + accounts[i]?.email + " " + accounts[i]?.host,
    );
  }
}

async function RunApp() {
  while (true) {
    await prompt();
  }
}

RunApp();
