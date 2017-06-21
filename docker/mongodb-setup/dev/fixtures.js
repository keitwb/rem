rem = connect('mongodb:27017/rem');

function upsert(collName, docs) {
  var coll = rem.getCollection(collName);

  print("Loading " + collName);
  docs.forEach(function(d) { coll.updateOne({ _id: d._id }, { $set: d }, { upsert: true }); });
}

upsert("properties", [
  {
    _id: "swamp-tract",
    createdDate: new Date("2017-02-01"),
    current: {
      name:         "Swamp Tract",
      description:  "Tract in the swamp land behind the old highway",
      acreage:      120.5,
      county:       "Pender",
      state:        "NC",
      propType:     "land",
      percentOwned: 100,
      pinNumbers:   ["123-45-678"],
      notes:        ["1", "2"],
      leases:       ["1", "2"],
      modifiedDate: new Date("2017-04-01"),
      modifiedBy:   "ben"
    },
    prev: [
      {
        name:         "Swamp Tract",
        description:  "Tract in the swamp land behind the old highway",
        acreage:      120.5,
        county:       "Pender",
        state:        "NC",
        leases:       ["1"],
        propType:     "land",
        percentOwned: 100,
        pinNumbers:   null,
        notes:        ["1"],
        modifiedDate: new Date("2017-03-01"),
        modifiedBy:   "ben"
      },
    ]
  },
  {
    _id: "office-building",
    createdDate: new Date("2017-01-01"),
    current: {
      name:         "Robeson Office Building",
      description:  "Old office building on Main St.",
      acreage:      0.5,
      county:       "Cumberland",
      state:        "NC",
      propType:     "commercial",
      pinNumbers:   ["123-45-678"],
      leases:       ["3"],
      modifiedDate: new Date("2017-05-01"),
      modifiedBy:   "ben"
    },
    prev: [
      {
        name:         "Robeson Office Building",
        description:  null,
        acreage:      0.5,
        county:       "Cumberland",
        state:        "NC",
        propType:     "commercial",
        pinNumbers:   ["123-45-678"],
        leases:       [],
        modifiedDate: new Date("2017-02-01"),
        modifiedBy:   "ben"
      },
    ]
  },
]);

upsert("leases", [
  {
    _id: "1",
    createdDate: new Date("2016-02-01"),
    current: {
      description:  "First lease",
      startDate:    new Date("2016-01-01"),
      termLength:   12,
      termUnit:     "months",
      rate:         100,
      lessees:      ["1"],
      media:        ["1"],
      notes:        [],
      modifiedDate: new Date("2016-02-05"),
      modifiedBy:   "ben",
    },
    prev: [
      {
        description:  "First lease",
        startDate:    new Date("2016-01-01"),
        termLength:   12,
        termUnit:     "months",
        rate:         100,
        lessees:      ["1"],
        media:        [],
        notes:        [],
        modifiedDate: new Date("2016-02-01"),
        modifiedBy:   "ben",
      },
    ],
  },
  {
    _id: "2",
    createdDate: new Date("2017-01-01"),
    current: {
      description: "Second lease",
      startDate:    new Date("2017-01-01"),
      termLength:   3,
      termUnit:     "years",
      rate:         100,
      modifiedDate: new Date("2016-11-01"),
      modifiedBy:   "ben",
    },
    prev: [
    ],
  }
]);

upsert("notes", [
  {
    _id: "1",
    createdDate: new Date("2017-03-01"),
    current: {
      note:           "Needs work -- lawn needs mowing.",
      modifiedDate:   new Date("2017-03-02"),
      lastModifiedBy: "ben"
    },
    prev: [
      {
        note:           "Needs work.",
        modifiedDate:   new Date("2017-03-01"),
        lastModifiedBy: "ben"
      },
    ]
  },
  {
    _id: "2",
    createdDate: new Date("2017-04-01"),
    current: {
      note:         "Work Completed.",
      modifiedDate: new Date("2017-04-01"),
      modifiedBy:   "ben"
    },
    prev: []
  }
]);

var fileMetadata = [
  { filename: "doc1.pdf", meta: { description: "2016 Tax Bill" } }
];

fileMetadata.forEach(function(o) {
  var fileDoc = rem.media.files.findOne({filename: o.filename});
  fileDoc.metadata = Object.assign({}, fileDoc.metadata, o.metadata);

  print("Updating file metadata for " + o.filename);
  if (rem.media.files.updateOne({ _id: fileDoc._id }, {$set: fileDoc}).modifiedCount != 1) {
    throw 'File not found: ' + o.filename;
  }
});
