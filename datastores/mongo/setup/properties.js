load("common.js")

// Properties
rem.createCollection("properties");  // This is idempotent

rem.runCommand({
   collMod:"properties",
   validator:{ $or: [
   ]},
   validationLevel:"strict"
});

setRelations("properties", [
  {
    rel: "leases",
    type: "MANY_TO_MANY",
    role: "OWNING",
    "target-coll": "leases",
    "ref-field": "$.leases.[*]",
  },
  {
    rel: "owners",
    type: "MANY_TO_MANY",
    role: "OWNING",
    "target-coll": "parties",
    "ref-field": "$.owners.[*].id",
  },
  {
    rel: "contacts",
    type: "MANY_TO_MANY",
    role: "OWNING",
    "target-coll": "parties",
    "ref-field": "$.contacts.[*]"
  },
  {
    rel: "notes",
    type: "ONE_TO_MANY",
    role: "OWNING",
    "target-coll": "notes",
    "ref-field": "$.notes.[*]",
  },
]);

