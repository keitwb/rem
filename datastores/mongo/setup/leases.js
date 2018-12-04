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
