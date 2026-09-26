import { genders } from "../../../../constants.js";
import request from "supertest";
import {
  closeTestDBConnection,
  testingDBConnection,
} from "../../../DB/db.connection.js";
import dotenv from "dotenv";
dotenv.config();
import { jest } from "@jest/globals";

const otp = "2ejfi";

const mockGenerate = jest.fn().mockReturnValue("2ejfi");

jest.unstable_mockModule("otp-generator", () => ({
  generate: mockGenerate,
}));

const { default: app } = await import("../../../../index.js");
const email = `sara-test-${Date.now()}@mail.com`;
let application;

beforeAll(async () => {
  await testingDBConnection();
  application = await app();
});

afterAll(async () => {
  await closeTestDBConnection();
});
describe("POST /register", () => {
  test("should pass with all params passed to it", async () => {
    let response = await request(application)
      .post("/auth/register")
      .send({
        email,
        password: "hash-123",
        confirmPassword: "hash-123",
        firstName: "sara",
        lastName: "test",
        DOB: new Date("1999-02-02"),
        mobileNumber: "01211111111",
        gender: genders.female,
      });

    expect(response.status).toEqual(201);
  });
});

describe("POST /confirm_otp", () => {
  test("should pass with all params passed to it", async () => {
    let response = await request(application).post("/auth/confirm_otp").send({
      email,
      otp,
    });
    expect(response.status).toEqual(200);
  });
});
