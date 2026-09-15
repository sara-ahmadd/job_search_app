import { jest } from "@jest/globals";
import { companyRepository } from "../../../models/company.model.js";
import { checkCompanyById } from "../../../utils/helpers/checkCompany.js";

describe("check if company with this id is already approved by admin", () => {
  test("find company with id", async () => {
    const fakeCompany = {
      id: 1,
      name: "TechNova Solutions",

      description:
        "TechNova Solutions is a software company that provides cloud-based business solutions and custom web applications for startups and growing companies.",

      industry: "Information Technology",

      address: "123 Business Avenue, Alexandria, Egypt",

      employeesCount: {
        from: 10,
        to: 50,
      },

      companyEmail: "contact@technova.com",

      createdBy: "66b8f123456789abcdef1234",

      hrs: ["66b8f123456789abcdef1235", "66b8f123456789abcdef1236"],

      bannedAt: null,

      deletedAt: null,

      approvedByAdmin: true,
    };
    jest.spyOn(companyRepository, "findById").mockResolvedValue(fakeCompany);
    let id = 1;
    let next = jest.fn();
    let company = await checkCompanyById(id, next);

    expect(company.id).toEqual(1);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
});
