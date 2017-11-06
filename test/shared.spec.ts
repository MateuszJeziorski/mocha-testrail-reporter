import * as chai from "chai";
chai.should();

import { titleToCaseIds, titleToSuiteId } from "../src/shared";

describe("Shared functions", () => {
  describe("titleToCaseIds", () => {
    it("Single test case id present", () => {
      let caseIds = titleToCaseIds("S2995 C123 Test title");
      caseIds.length.should.be.equals(1);
      caseIds[0].should.be.equals(123);

      caseIds = titleToCaseIds("Suite S2995 Execution of C123 Test title");
      caseIds.length.should.be.equals(1);
      caseIds[0].should.be.equals(123);
    });

    it("Multiple test case ids present", () => {
      const caseIds = titleToCaseIds("S2995 Execution C321 C123 Test title");
      caseIds.length.should.be.equals(2);
      caseIds[0].should.be.equals(321);
      caseIds[1].should.be.equals(123);
    });

    it("No test case ids present", () => {
      const caseIds = titleToCaseIds("S2995 Execution Test title");
      caseIds.length.should.be.equals(0);
    });
  });

  describe("titleToSuiteIds", () => {
    it("Single suite id present", () => {
      let suiteId = titleToSuiteId("S2995 C123 Test title");
      suiteId.should.be.equals(2995);

      suiteId = titleToSuiteId("Suite S2995 Execution of C123 Test title");
      suiteId.should.be.equals(2995);
    });

    it("No suite id present", () => {
      const suiteId = titleToSuiteId("Execution Test title");
      chai.assert.isUndefined(suiteId);
    });
  });
});
