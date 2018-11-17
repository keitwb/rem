load("util.js");

upsert("notes", [
  {
    _id: ID(1),
    createdDate: new Date("2017-03-01"),
    createdBy:   ID(1),
    note:        "Needs work -- lawn needs mowing.",
  },
  {
    _id: ID(2),
    createdDate: new Date("2017-04-01"),
    createdBy:   ID(1),
    note:        "Work Completed.",
  }
]);

