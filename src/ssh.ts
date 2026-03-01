import { Account } from "./types";

export function buildSsh(account: Account) {
  return [
    "Host " + account.host,
    " HostName " + account.host,
    " User git",
    " IdentityFile " + account.privateKeyPath,
    " IdentitiesOnly yes",
  ].join("\n");
}
