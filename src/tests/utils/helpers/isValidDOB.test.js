import { isValidDOB } from "../../../utils/helpers/isValidDOB";

describe("check if date of birth is valid", () => {
  it("check should pass", () => {
    let date = new Date("1999-05-20");
    expect(isValidDOB(date)).toBeTruthy();
  });
  it("check should fail", () => {
    let date = new Date("2026-05-20");
    expect(isValidDOB(date)).toBeFalsy();
  });
  it("check should fail", () => {
    expect(isValidDOB()).toBeFalsy();
  });
});
