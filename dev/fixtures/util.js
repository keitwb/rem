rem = connect('mongo:27017/rem');

function upsert(collName, docs) {
  var coll = rem.getCollection(collName);

  print("Loading " + collName);
  docs.forEach(function(d) {
    coll.updateOne({ _id: d._id }, { $set: d }, { upsert: true });
  });
}

// An arbitrary object id that provides a consistent starting point for reproducable ids for dev
// fixtures
var baseID = new ObjectId("5baed558271a70141ba90000")

function incrementHex(hex, amount) {
  return (parseInt("0x" + hex) + amount).toString(16);
}

function ID(offset) {
  // We have to only increment that last 4 bytes because JS numbers can't handle > 53 bits of
  // precision on integers.
  var id = baseID.str.slice(0, 16) + incrementHex(baseID.str.slice(16, 24), offset)
  return new ObjectId(id);
}

function fileByFileName(filename) {
  return rem.media.files.findOne({filename: filename});
}

