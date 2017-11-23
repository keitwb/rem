// All commands are idempotent or guarded so that this script can be run
// multiple times over the same database.

function main() {
  rs.initiate();
  sleep(2500);

  load("properties.js");
  load("leases.js");
  load("parties.js");
  load("notes.js");
  load("media.js");
}

main();
