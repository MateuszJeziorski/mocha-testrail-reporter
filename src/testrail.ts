import * as CI from "ci-info";
import request = require("unirest");
import { TestRailOptions, TestRailResult } from "./testrail.interface";

function twoDigits(value) {
  return ("0" + value).slice(-2);
}

export function formatDate(date: Date) {
  const year = date.getUTCFullYear();
  const month = twoDigits(date.getUTCMonth() + 1);
  const day = twoDigits(date.getUTCDate());

  return `${month}/${day}/${year}`;
}

/**
 * TestRail basic API wrapper
 */
export class TestRail {
  private static _handleResponse(res, callback, error?) {
    if (res.error) {
      console.log("Error: %s", JSON.stringify(res.body));
      if (error) {
        error(res.error);
      } else {
        throw new Error(res.error);
      }
    }
    callback(res.body);
  }

  private base: string;
  private username: string;
  private password: string;

  constructor(private options: TestRailOptions) {
    // compute base url
    if (options.url) {
      this.base = options.url + "/index.php";
    } else {
      this.base = `https://${options.domain}/index.php`;
    }

    this.username = process.env.TESTRAIL_USERNAME || options.username;
    this.password = process.env.TESTRAIL_PASSWORD || options.password;
  }

  /**
   * Publishes results of execution of an automated test run
   * @param {string} description
   * @param {TestRailResult[]} results
   * @param callback
   */
  public publish(description: string, results: TestRailResult[], callback?): void {
    console.log(`Publishing ${results.length} test result(s) to ${this.base}`);
    if (!results.length) {
      console.warn("Got 0 results, skipping");
      if (callback) {
        callback();
      }
      return;
    }

    const now = formatDate(new Date());
    const groupedBySuiteId: { [key: string]: TestRailResult[] } = {};
    results.forEach(result => {
      result.custom_date = now;

      if (!groupedBySuiteId[result.suiteId]) {
        groupedBySuiteId[result.suiteId] = [];
      }
      groupedBySuiteId[result.suiteId].push(result);
      delete result.suiteId;
    });

    const tasks = [];
    for (const suiteId in groupedBySuiteId) {
      if (groupedBySuiteId.hasOwnProperty(suiteId)) {
        tasks.push(this.publishSuite(suiteId, description, groupedBySuiteId[suiteId]));
      }
    }

    Promise.all(tasks).then(() => {
      if (callback) {
        callback();
      }
    });
  }

  /**
   * Publishes results of execution of an automated test run
   * @param {string} suiteId
   * @param {string} description
   * @param {TestRailResult[]} results
   */
  private publishSuite(
    suiteId: string,
    description: string,
    results: TestRailResult[]
  ): Promise<void> {
    const name = (() => {
      const runner = CI.isCI ? CI.name : process.env.USER || "<unknown>";
      return `Automated test for suite ${suiteId} run ${new Date().toISOString()} by ${runner}`;
    })();

    return new Promise(resolve => {
      this._post(
        `add_run/${this.options.projectId}`,
        {
          suite_id: suiteId,
          name,
          description,
          assignedto_id: this.options.assignedToId,
          include_all: true
        },
        body => {
          const runId = body.id;
          const caseIds = results.map(result => result.case_id);
          console.log(
            `Results for suite S${suiteId} published to ${this
              .base}?/runs/view/${runId}. Cases: ${caseIds.join(", ")}`
          );
          this._post(
            `add_results_for_cases/${runId}`,
            {
              results
            },
            resolve
          );
        }
      );
    });
  }

  private _post(api: string, body: any, callback, error?) {
    request("POST", this.base)
      .query(`/api/v2/${api}`)
      .headers({
        "content-type": "application/json"
      })
      .type("json")
      .send(body)
      .auth(this.username, this.password)
      .end(res => {
        TestRail._handleResponse(res, callback, error);
      });
  }

  private _get(api: string, callback, error?) {
    request("GET", this.base)
      .query(`/api/v2/${api}`)
      .headers({
        "content-type": "application/json"
      })
      .type("json")
      .auth(this.username, this.password)
      .end(res => {
        TestRail._handleResponse(res, callback, error);
      });
  }
}
