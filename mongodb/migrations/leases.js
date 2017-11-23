load("common.js");

// Leases
rem.createCollection("leases");

rem.runCommand({
   collMod:"leases",
   validator:{ $and: [
     {
       $or: [
         { "options.leaseType": { $exists: false } },
         { "options.leaseType": { $eq: "option" } },
       ]
     }
   ]},
   validationLevel:"strict"
});

rem.leases.dropIndex("text-search");
rem.leases.createIndex({ "$**": "text" }, {name: "text-search"});
setRelations("leases", [
  {
    rel: "properties",
    type: "MANY_TO_MANY",
    role: "INVERSE",
    "target-coll": "properties",
    "ref-field": "$.leases.[*]",
  },
  {
    rel: "lessees",
    type: "MANY_TO_MANY",
    role: "OWNING",
    "target-coll": "parties",
    "ref-field": "$.lessees.[*]"
  }
]);
