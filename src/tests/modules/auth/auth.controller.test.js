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
const mockSendEmail = jest.fn();
const mockEmit = jest.fn();

jest.unstable_mockModule("../../../utils/emails/sendEmail.js", () => ({
  sendEmail: mockSendEmail,
  myEventEmitter: {
    emit: mockEmit,
  },
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

describe("POST /login_credentials", () => {
  test("should pass with all params passed to it", async () => {
    let response = await request(application)
      .post("/auth/login_credentials")
      .send({ password: "hash-123", email });
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        data: {
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        },
        message: "Logged in successfully",
        status: "Success",
      }),
    );
  });
  test("should fail with invalid credentials", async () => {
    let response = await request(application)
      .post("/auth/login_credentials")
      .send({ password: "hash-1234", email });
    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        error: "Credentials are invalid",
        status: "Error",
      }),
    );
  });
});

describe("POST /google_auth", () => {
  test("should pass with correct body", async () => {
    let response = await request(application).post("/auth/google_auth").send({
      idToken:
        "eyJhbGciOiJSUzI1NiIsImtpZCI6Ijk0M2EzYTVkN2Q5MTk2MjVhNDU0ZTQ4OWI3NWMyOWFkYWI1N2FjYmEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI3NzU4NTc4MDg1MDMtN2MwMmRkdWFpZDhhazNmdTVsbGo4YW5wNDFxMzhuMDQuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI3NzU4NTc4MDg1MDMtN2MwMmRkdWFpZDhhazNmdTVsbGo4YW5wNDFxMzhuMDQuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDE0NDQwOTk4MjUzMzk1NjkzMzAiLCJlbWFpbCI6InNhcmFhaG1hZDIwNjAwMzlAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5iZiI6MTc5MTAyOTQ2MiwibmFtZSI6IlNhcmEgQWhtYWQiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jS0Z0a1VIbUt5R3oxT0Vxc0I3ME82bnVkMi0xTllxSmJtZG9kRlFXclBZU0o3UW5nPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6IlNhcmEiLCJmYW1pbHlfbmFtZSI6IkFobWFkIiwiaWF0IjoxNzkxMDI5NzYyLCJleHAiOjE3OTEwMzMzNjIsImp0aSI6ImQ3NjVhYmMwNDg3NzU1Y2YwNDVlZDdiZWJmODEwMjBkOWNkNjAxNjYifQ.fVZ2Aziimhidh3p5OJMYOt8nodwd4fUCX6L6dMp0WkQr4eAIaqEOTGbPtnf93i0UtRrLwmxGUygBRhs1F7WKJNqsdueBbv_sXrb-MlR_6z7zGwZwA-j91i6x276_xo3kIC8frgwhOqtTNDTLmyTdhhYOPHTv9dE06p_HItn9roY9pFKMAHFXa2uv-xV7diEOvgKQ8-uaj_2NVE9ODzzvgwHOsjNuXVQwmkjwQkE13wpI_OYCkfQhG_5bZvEJcMEu_JjKUEAw8GFQy44ZD1Qt-wXEMVeG01NEqnboPLccJaoIs4S_la4okgn6n-Cv91jBv2l3VSfvm5y-2v2vB2nipg",
    });

    expect(response.status).toEqual(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        data: {
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        },
        message: "Logged in with google successfully",
        status: "Success",
      }),
    );
  });
  test("should fail with incorrect idToken", async () => {
    let response = await request(application)
      .post("/auth/google_auth")
      .send({ idToken: "123knrflsjdk.sdvnmskldfnv.sdvsdevfs" });

    expect(response.status).toEqual(500);
    expect(response.body).toEqual(
      expect.objectContaining({
        status: "Error",
        error: "Invalid Google token",
      }),
    );
  });
});
