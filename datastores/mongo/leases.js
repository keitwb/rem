// Leases
db.createCollection("leases");

db.runCommand({
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
