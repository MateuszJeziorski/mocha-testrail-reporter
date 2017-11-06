"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const shared_1 = require("./shared");
const testrail_1 = require("./testrail");
const testrail_interface_1 = require("./testrail.interface");
class MochaTestRailReporter extends mocha_1.reporters.Spec {
    constructor(runner, options) {
        super(runner);
        this.results = [];
        this.passes = 0;
        this.fails = 0;
        this.pending = 0;
        this.out = [];
        if (!process.env.TESTRAIL_USE) {
            return;
        }
        const reporterOptions = options.reporterOptions;
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
            this.addResults(test, testrail_interface_1.Status.Passed);
        });
        runner.on("fail", test => {
            this.fails++;
            this.out.push(test.fullTitle() + ": fail");
            this.addResults(test, testrail_interface_1.Status.Failed);
        });
        runner.on("end", () => {
            if (!this.results.length) {
                console.warn("No testcases were matched. Ensure that your tests are declared correctly and matches TCxxx");
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
            new testrail_1.TestRail(reporterOptions).publish(description, this.results);
        });
    }
    addResults(test, status) {
        const caseIds = shared_1.titleToCaseIds(test.title);
        const suiteId = shared_1.titleToSuiteId(test.fullTitle());
        let comment = test.title;
        if (status === testrail_interface_1.Status.Failed) {
            comment = `${test.title} (${test.duration}ms)`;
        }
        else if (test.speed === "fast") {
            comment = `${test.title} (${test.duration}ms)`;
        }
        if (suiteId && caseIds.length > 0) {
            const results = caseIds.map(caseId => {
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
    validate(options, names) {
        if (options == null) {
            throw new Error("Missing --reporter-options in mocha.opts");
        }
        if (names.every(name => !options[name])) {
            throw new Error(`Missing one of [${names.join(",")}] option. Please update --reporter-options in mocha.opts`);
        }
    }
}
exports.MochaTestRailReporter = MochaTestRailReporter;
//# sourceMappingURL=mocha-testrail-reporter.js.map