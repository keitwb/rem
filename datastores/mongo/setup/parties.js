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
setRelations("parties", [
  {
    rel: "properties-contacts",
    type: "MANY_TO_MANY",
    role: "INVERSE",
    "target-coll": "properties",
    "ref-field": "$.contacts.[*]",
  },
  {
    rel: "properties-owned",
    type: "MANY_TO_MANY",
    role: "INVERSE",
    "target-coll": "properties",
    "ref-field": "$.owners.[*].id",
  },
  {
    rel: "leases-held",
    type: "MANY_TO_MANY",
    role: "INVERSE",
    "target-coll": "leases",
    "ref-field": "$.lessees.[*]"
  },
  {
    rel: "parent-parties",
    type: "MANY_TO_ONE",
    role: "INVERSE",
    "target-coll": "parties",
    "ref-field": "$.subParties.[*]",
  },
]);
