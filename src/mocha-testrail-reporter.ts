import { reporters } from "mocha";
import { titleToCaseIds, titleToSuiteId } from "./shared";
import { TestRail } from "./testrail";
import { Status, TestRailOptions, TestRailResult } from "./testrail.interface";

export class MochaTestRailReporter extends reporters.Spec {
  private results: TestRailResult[] = [];
  private passes: number = 0;
  private fails: number = 0;
  private pending: number = 0;
  private out: string[] = [];

  constructor(runner: any, options: any) {
    super(runner);

    if (!process.env.TESTRAIL_USE) {
      return;
    }

    const reporterOptions: TestRailOptions = options.reporterOptions as TestRailOptions;
    this.validate(reporterOptions, ["domain", "url"]);
    if (!process.env.TESTRAIL_USERNAME) {
      this.validate(reporterOptions, ["username"]);
    }
    if (!process.env.TESTRAIL_PASSWORD) {
      this.validate(reporterOptions, ["password"]);
    }
    this.validate(reporterOptions, ["projectId"]);

    runner.on("start", () => {
      /* ignore */
    });

    runner.on("suite", suite => {
      /* ignore */
    });

    runner.on("suite end", () => {
      /* ignore */
    });

    runner.on("pending", test => {
      this.pending++;
      this.out.push(test.fullTitle() + ": pending");
    });

    runner.on("pass", test => {
      this.passes++;
      this.out.push(test.fullTitle() + ": pass");
      this.addResults(test, Status.Passed);
    });

    runner.on("fail", test => {
      this.fails++;
      this.out.push(test.fullTitle() + ": fail");
      this.addResults(test, Status.Failed);
    });

    runner.on("end", () => {
      if (!this.results.length) {
        console.warn(
          "No testcases were matched. Ensure that your tests are declared correctly and matches TCxxx"
        );
      }
      const total = this.passes + this.fails + this.pending;

      const description = `Automated test run executed on ${new Date().toISOString()}
Execution summary:
Passes: ${this.passes}
Fails: ${this.fails}
Pending: ${this.pending}
Total: ${total}

Execution details:
${this.out.join("\n")}
`;
      new TestRail(reporterOptions).publish(description, this.results);
    });
  }

  private addResults(test, status: Status) {
    const caseIds = titleToCaseIds(test.title);
    const suiteId = titleToSuiteId(test.fullTitle());

    let comment = test.title;
    if (status === Status.Failed) {
      comment = `${test.title} (${test.duration}ms)`;
    } else if (test.speed === "fast") {
      comment = `${test.title} (${test.duration}ms)`;
    }

    if (suiteId && caseIds.length > 0) {
      const results: TestRailResult[] = caseIds.map(caseId => {
        return {
          suiteId,
          case_id: caseId,
          status_id: status,
          comment
        };
      });
      this.results.push(...results);
    }
  }

  private validate(options: TestRailOptions, names: string[]) {
    if (options == null) {
      throw new Error("Missing --reporter-options in mocha.opts");
    }
    if (names.every(name => !options[name])) {
      throw new Error(
        `Missing one of [${names.join(",")}] option. Please update --reporter-options in mocha.opts`
      );
    }
  }
}
