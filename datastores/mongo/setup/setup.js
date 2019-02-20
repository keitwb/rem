// All commands are idempotent or guarded so that this script can be run
// multiple times over the same database.

var rem = connect('127.0.0.1:27017/rem');

function main() {
  rs.initiate();
  sleep(3000);

  load("properties.js");
  load("leases.js");
  load("parties.js");
  load("notes.js");
  load("media.js");
}

main();
