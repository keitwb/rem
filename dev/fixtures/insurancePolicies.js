load("util.js");

upsert("insurancePolicies", [
  {
    _id: ID(100),
    createdDate: new Date("2017-03-01"),
    createdBy:   ID(1),
    description: "Second insurance policy",
    startDate: new Date("2019-03-01"),
    endDate: new Date("2020-03-01"),
  },
  {
    _id: ID(101),
    createdDate: new Date("2017-04-01"),
    createdBy:   ID(1),
    description: "First insurance policy",
    startDate: new Date("2018-03-01"),
    endDate: new Date("2019-03-01"),
  }
]);

