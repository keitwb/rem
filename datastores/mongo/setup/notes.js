load("common.js");

// Notes
rem.createCollection("notes");
rem.runCommand({
   collMod:"notes",
   validator:{},
   validationLevel:"strict"
});
