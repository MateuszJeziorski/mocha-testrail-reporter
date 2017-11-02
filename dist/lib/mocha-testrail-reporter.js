"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var mocha_1 = require("mocha");
var shared_1 = require("./shared");
var testrail_1 = require("./testrail");
var testrail_interface_1 = require("./testrail.interface");
var MochaTestRailReporter = /** @class */ (function (_super) {
    __extends(MochaTestRailReporter, _super);
    function MochaTestRailReporter(runner, options) {
        var _this = _super.call(this, runner) || this;
        _this.results = [];
        _this.passes = 0;
        _this.fails = 0;
        _this.pending = 0;
        _this.out = [];
        if (process.env.TESTRAIL_DISABLED) {
            return _this;
        }
        var reporterOptions = options.reporterOptions;
        _this.validate(reporterOptions, ["domain", "url"]);
        if (!process.env.TESTRAIL_USERNAME) {
            _this.validate(reporterOptions, ["username"]);
        }
        if (!process.env.TESTRAIL_PASSWORD) {
            _this.validate(reporterOptions, ["password"]);
        }
        _this.validate(reporterOptions, ["projectId"]);
        _this.validate(reporterOptions, ["suiteId"]);
        runner.on("start", function () {
            /* ignore */
        });
        runner.on("suite", function () {
            /* ignore */
        });
        runner.on("suite end", function () {
            /* ignore */
        });
        runner.on("pending", function (test) {
            _this.pending++;
            _this.out.push(test.fullTitle() + ": pending");
        });
        runner.on("pass", function (test) {
            _this.passes++;
            _this.out.push(test.fullTitle() + ": pass");
            var caseIds = shared_1.titleToCaseIds(test.title);
            if (caseIds.length > 0) {
                if (test.speed === "fast") {
                    var results = caseIds.map(function (caseId) {
                        return {
                            case_id: caseId,
                            status_id: testrail_interface_1.Status.Passed,
                            comment: test.title
                        };
                    });
                    (_a = _this.results).push.apply(_a, results);
                }
                else {
                    var results = caseIds.map(function (caseId) {
                        return {
                            case_id: caseId,
                            status_id: testrail_interface_1.Status.Passed,
                            comment: test.title + " (" + test.duration + "ms)"
                        };
                    });
                    (_b = _this.results).push.apply(_b, results);
                }
            }
            var _a, _b;
        });
        runner.on("fail", function (test) {
            _this.fails++;
            _this.out.push(test.fullTitle() + ": fail");
            var caseIds = shared_1.titleToCaseIds(test.title);
            if (caseIds.length > 0) {
                var results = caseIds.map(function (caseId) {
                    return {
                        case_id: caseId,
                        status_id: testrail_interface_1.Status.Failed,
                        comment: test.title + "\n" + test.err
                    };
                });
                (_a = _this.results).push.apply(_a, results);
            }
            var _a;
        });
        runner.on("end", function () {
            if (!_this.results.length) {
                console.warn("No testcases were matched. Ensure that your tests are declared correctly and matches TCxxx");
            }
            var executionDateTime = new Date().toISOString();
            var total = _this.passes + _this.fails + _this.pending;
            var name = "Automated test run " + executionDateTime;
            var description = "Automated test run executed on " + executionDateTime + "\nExecution summary:\nPasses: " + _this.passes + "\nFails: " + _this.fails + "\nPending: " + _this.pending + "\nTotal: " + total + "\n\nExecution details:\n" + _this.out.join("\n") + "\n";
            new testrail_1.TestRail(reporterOptions).publish(name, description, _this.results);
        });
        return _this;
    }
    MochaTestRailReporter.prototype.validate = function (options, names) {
        if (options == null) {
            throw new Error("Missing --reporter-options in mocha.opts");
        }
        if (names.every(function (name) { return !options[name]; })) {
            throw new Error("Missing one of [" + names.join(",") + "] option. Please update --reporter-options in mocha.opts");
        }
    };
    return MochaTestRailReporter;
}(mocha_1.reporters.Spec));
exports.MochaTestRailReporter = MochaTestRailReporter;
//# sourceMappingURL=mocha-testrail-reporter.js.map