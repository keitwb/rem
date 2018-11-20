load("util.js");

upsert("leases", [
  {
    _id: ID(1),
    createdDate:  new Date("2016-02-01"),
    createdBy:    ID(1),
    description:  "First lease",
    startDate:    new Date("2016-01-01"),
    termLength:   12,
    termUnit:     "months",
    rate:         100,
    lessees:      [ID(1)],
    notes:        [],
    _updates: [],
  },
  {
    _id: ID(2),
    createdDate: new Date("2017-01-01"),
    createdBy:   ID(1),
    description: "Second lease",
    startDate:   new Date("2017-01-01"),
    termLength:  3,
    termUnit:    "years",
    rate:        100,
    _updates: [ ],
  }
]);

