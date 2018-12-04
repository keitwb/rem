rem.createCollection("properties");  // This is idempotent

rem.runCommand({
   collMod:"properties",
   validator:{ $or: [
   ]},
   validationLevel:"strict"
});
