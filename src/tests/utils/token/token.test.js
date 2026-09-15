import { generateToken, verifyToken } from "../../../utils/token/token.js";
import dotenv from "dotenv";
dotenv.config();
describe("check functionality of generate/verify token functions", () => {
  beforeAll(() => {
    process.env.JWT_SECRET_KEY = "test-secret-key";
  });
  test("generate function works properly", () => {
    const payload = {
      id: 1,
      email: "test@test.com",
    };
    let token = generateToken(payload, "12m");
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");
  });
  test("generate function returns undefined if no payload or expiration time passed", () => {
    let token = generateToken();
    expect(token).toBeUndefined();
  });
  test("verify function works properly", () => {
    let decode = verifyToken(
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QGdtYWlsLmNvbSIsImlhdCI6MTUxNjIzOTAyMn0.uY7u7yMqb4HtuwYqKDQE0eX1h5ALbnzCzPVxvNvcLak",
    );
    expect(decode).toBeDefined();
    expect(decode).toEqual({
      id: 1,
      email: "test@gmail.com",
      iat: 1516239022,
    });
  });
  test("verify function returns undefined if no token passed to it", () => {
    let decode = verifyToken();
    expect(decode).toBeUndefined();
  });
});
