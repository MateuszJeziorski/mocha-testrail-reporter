"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request = require("unirest");
function twoDigits(value) {
    return ("0" + value).slice(-2);
}
function formatDate(date) {
    var year = date.getUTCFullYear();
    var month = twoDigits(date.getUTCMonth() + 1);
    var day = twoDigits(date.getUTCDate());
    return month + "/" + day + "/" + year;
}
exports.formatDate = formatDate;
/**
 * TestRail basic API wrapper
 */
var TestRail = /** @class */ (function () {
    function TestRail(options) {
        this.options = options;
        // compute base url
        if (options.url) {
            this.base = options.url + "/index.php";
        }
        else {
            this.base = "https://" + options.domain + "/index.php";
        }
        this.username = process.env.TESTRAIL_USERNAME || options.username;
        this.password = process.env.TESTRAIL_PASSWORD || options.password;
    }
    TestRail._handleResponse = function (res, callback, error) {
        if (res.error) {
            console.log("Error: %s", JSON.stringify(res.body));
            if (error) {
                error(res.error);
            }
            else {
                throw new Error(res.error);
            }
        }
        callback(res.body);
    };
    /**
     * Fetches test cases from projet/suite based on filtering criteria (optional)
     */
    TestRail.prototype.fetchCases = function (filters, callback) {
        var filter = "";
        if (filters) {
            for (var key in filters) {
                if (filters.hasOwnProperty(key)) {
                    filter += "&" + key + "=" + filters[key].join(",");
                }
            }
        }
        this._get("get_cases/" + this.options.projectId + "&suite_id=" + this.options.suiteId + filter, function (body) {
            if (callback) {
                callback(body);
            }
        });
    };
    /**
     * Publishes results of execution of an automated test run
     * @param {string} name
     * @param {string} description
     * @param {TestRailResult[]} results
     * @param callback
     */
    TestRail.prototype.publish = function (name, description, results, callback) {
        var _this = this;
        if (process.env.TESTRAIL_DISABLED) {
            console.warn("Testrail report disabled");
            return;
        }
        console.log("Publishing " + results.length + " test result(s) to " + this.base);
        var now = formatDate(new Date());
        results.forEach(function (result) {
            result.custom_date = now;
        });
        this._post("add_run/" + this.options.projectId, {
            suite_id: this.options.suiteId,
            name: name,
            description: description,
            assignedto_id: this.options.assignedToId,
            include_all: true
        }, function (body) {
            var runId = body.id;
            console.log("Results published to " + _this.base + "?/runs/view/" + runId);
            _this._post("add_results_for_cases/" + runId, {
                results: results
            }, function () {
                // execute callback if specified
                if (callback) {
                    callback();
                }
            });
        });
    };
    TestRail.prototype._post = function (api, body, callback, error) {
        request("POST", this.base)
            .query("/api/v2/" + api)
            .headers({
            "content-type": "application/json"
        })
            .type("json")
            .send(body)
            .auth(this.username, this.password)
            .end(function (res) {
            TestRail._handleResponse(res, callback, error);
        });
    };
    TestRail.prototype._get = function (api, callback, error) {
        request("GET", this.base)
            .query("/api/v2/" + api)
            .headers({
            "content-type": "application/json"
        })
            .type("json")
            .auth(this.username, this.password)
            .end(function (res) {
            TestRail._handleResponse(res, callback, error);
        });
    };
    return TestRail;
}());
exports.TestRail = TestRail;
//# sourceMappingURL=testrail.js.map