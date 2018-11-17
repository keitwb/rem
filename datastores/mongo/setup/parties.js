load("common.js");

// Parties
rem.createCollection("parties");

rem.runCommand({
   collMod:"parties",
   validator:{ $or: [
     { "type": { $in: ["person", "company"] } }
   ]},
   validationLevel:"strict"
});

rem.parties.dropIndex("text-search");
rem.parties.createIndex({ "$**": "text" }, {name: "text-search"});
