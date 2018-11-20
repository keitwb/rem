load("common.js");

// Notes
rem.createCollection("notes");
rem.runCommand({
   collMod:"notes",
   validator:{},
   validationLevel:"strict"
});

rem.notes.dropIndex("text-search");
rem.notes.createIndex({ "$**": "text" }, {name: "text-search"});
