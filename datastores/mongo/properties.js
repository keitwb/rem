print("Creating properties collection");
db.createCollection("properties");  // This is idempotent

db.runCommand({
   collMod:"properties",
   validator:{ $or: [
   ]},
   validationLevel:"strict"
});
