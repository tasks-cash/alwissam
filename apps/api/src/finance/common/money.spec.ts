import {
  moneyAdd,
  moneyLteZero,
  moneyMax0,
  moneySub,
  moneyToFixed2,
} from "./money";

describe("money helpers", () => {
  it("adds and subtracts without float drift", () => {
    expect(moneyToFixed2(10.1)).toBe("10.10");
    expect(moneyAdd("10.10", "0.20")).toBe("10.30");
    expect(moneySub("10.00", "3.50")).toBe("6.50");
    expect(moneyMax0("-1.00")).toBe("0.00");
    expect(moneyLteZero("0.00")).toBe(true);
  });
});
