export interface TestRailOptions {
  domain?: string;
  url?: string;
  username: string;
  password: string;
  projectId: number;
  assignedToId?: number;
}

export enum Status {
  Passed = 1,
  Blocked = 2,
  Untested = 3,
  Retest = 4,
  Failed = 5
}

export interface TestRailResult {
  case_id: number;
  suiteId: number;
  status_id: Status;
  comment?: string;
  custom_date?: string;
}
