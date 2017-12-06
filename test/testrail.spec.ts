import { TestRail } from "../src/testrail";
import { Status } from "../src/testrail.interface";

describe.skip("TestRail API", () => {
  it("Publish test run", done => {
    const testRail = new TestRail({
      domain: process.env.DOMAIN,
      username: process.env.USERNAME,
      password: process.env.PASSWORD,
      projectId: 10,
      assignedToId: 2
    });

    testRail.publish(
      "Unit Test of mocha-testrail-reporter",
      [
        {
          suiteId: 1,
          case_id: 3033,
          status_id: Status.Passed,
          comment: "Passing...."
        },
        {
          suiteId: 1,
          case_id: 3034,
          status_id: Status.Passed
        },
        {
          suiteId: 1,
          case_id: 3035,
          status_id: Status.Passed
        },
        {
          suiteId: 1,
          case_id: 3036,
          status_id: Status.Failed,
          comment: "Failure...."
        }
      ],
      done
    );
  });
});
