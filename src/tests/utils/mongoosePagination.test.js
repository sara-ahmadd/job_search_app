import { companyRepository } from "../../DB/repositories/index.js";
import { jest } from "@jest/globals";

// import "../../utils/mongoosePagination.js";
import paginate from "../../utils/mongoosePagination.js";

describe("test paginate function added to mongoose query prototype", () => {
  test("check paginate is added successfully", async () => {
    const query = companyRepository.find();
    expect(typeof query.paginate).toBe("function");
  });
  test("check paginate is added successfully", async () => {
    const fakeData = [{ name: "Company 1" }, { name: "Company 2" }];
    // recognize dependencies
    // mock them
    const fakeQuery = {
      skip: jest.fn(),
      limit: jest.fn(),
      sort: jest.fn(),
      model: {
        countDocuments: jest.fn(),
      },
      getQuery: jest.fn(),
    };

    // recognize their return values
    //also mock them
    fakeQuery.skip.mockReturnValue(fakeQuery);
    fakeQuery.limit.mockReturnValue(fakeQuery);
    fakeQuery.sort.mockResolvedValue(fakeData);

    fakeQuery.getQuery.mockReturnValue();
    fakeQuery.model.countDocuments.mockResolvedValue(30);

    let result = await paginate.call(fakeQuery);
    expect(result).toEqual({
      data: fakeData,
      totalItems: 30,
      totalPages: 8,
      itemsPerPage: 2,
    });
  });
});
