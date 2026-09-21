import { genders } from "../../../../constants.js";
import request from "supertest";
import {
  closeTestDBConnection,
  testingDBConnection,
} from "../../../DB/db.connection.js";
import dotenv from "dotenv";
dotenv.config();

const { default: app } = await import("../../../../index.js");

describe("POST /register", () => {
  let application;
  beforeAll(async () => {
    await testingDBConnection();
    application = await app();
  });

  afterAll(async () => {
    await closeTestDBConnection();
  });
  test("should pass with all params passed to it", async () => {
    const email = `test-${Date.now()}@mail.com`;
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
    console.log("STATUS:", response.status);
    console.log("BODY:", response.body);
    expect(response.status).toEqual(201);
  });
});
