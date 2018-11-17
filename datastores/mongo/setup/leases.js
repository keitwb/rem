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
