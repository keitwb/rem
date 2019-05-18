// Notes
db.createCollection("notes");
db.runCommand({
   collMod:"notes",
   validator:{},
   validationLevel:"strict"
});
