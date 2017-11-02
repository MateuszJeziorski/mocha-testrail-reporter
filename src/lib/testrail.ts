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
   * Fetches test cases from projet/suite based on filtering criteria (optional)
   */
  public fetchCases(filters?: { [key: string]: number[] }, callback?): void {
    let filter = "";
    if (filters) {
      for (const key in filters) {
        if (filters.hasOwnProperty(key)) {
          filter += "&" + key + "=" + filters[key].join(",");
        }
      }
    }

    this._get(
      `get_cases/${this.options.projectId}&suite_id=${this.options.suiteId}${filter}`,
      body => {
        if (callback) {
          callback(body);
        }
      }
    );
  }

  /**
   * Publishes results of execution of an automated test run
   * @param {string} name
   * @param {string} description
   * @param {TestRailResult[]} results
   * @param callback
   */
  public publish(name: string, description: string, results: TestRailResult[], callback?): void {
    console.log(`Publishing ${results.length} test result(s) to ${this.base}`);

    const now = formatDate(new Date());
    results.forEach(result => {
      result.custom_date = now;
    });

    this._post(
      `add_run/${this.options.projectId}`,
      {
        suite_id: this.options.suiteId,
        name,
        description,
        assignedto_id: this.options.assignedToId,
        include_all: true
      },
      body => {
        const runId = body.id;
        console.log(`Results published to ${this.base}?/runs/view/${runId}`);
        this._post(
          `add_results_for_cases/${runId}`,
          {
            results
          },
          () => {
            // execute callback if specified
            if (callback) {
              callback();
            }
          }
        );
      }
    );
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
