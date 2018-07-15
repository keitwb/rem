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
setRelations("notes", [
  {
    rel: "properties",
    type: "MANY_TO_ONE",
    role: "INVERSE",
    "target-coll": "properties",
    "ref-field": "$.notes.[*]",
  },
  {
    rel: "leases",
    type: "MANY_TO_ONE",
    role: "INVERSE",
    "target-coll": "leases",
    "ref-field": "$.notes.[*]"
  },
  {
    rel: "parties",
    type: "MANY_TO_ONE",
    role: "INVERSE",
    "target-coll": "parties",
    "ref-field": "$.notes.[*]"
  }
]);

