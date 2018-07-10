
var rem = connect('127.0.0.1:27017/rem');

function setRelations(coll, rels) {
  return setMetadata(coll, "rels", rels);
}

function setAggregations(coll, aggrs) {
  return setMetadata(coll, "aggrs", aggrs);
}

function setMetadata(coll, fieldName, val) {
  var metaColl = "_properties";
  var propDocId = metaColl + "." + coll;

  // RESTHeart metadata colletion
  rem.createCollection(metaColl);

  var unsetVal = {};
  unsetVal[fieldName] = "";

  // Drop previous
  rem.getCollection(metaColl).updateOne(
    { _id: propDocId },
    { $unset: unsetVal});

  var setVal = {};
  setVal[fieldName] = val;
  // Add back field
  rem.getCollection(metaColl).updateOne(
    { _id: propDocId },
    { $set: { name: coll },
      $set: setVal },
    { upsert: true });
}
