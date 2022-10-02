import "mocha";
import { expect } from "chai";
import * as ShortcutsUtils from "../utils/shortlinks";
const { getAllShortcuts, getShortcutDetails, createShortLink } =
  ShortcutsUtils.default;
describe("Core Features Utilities' test", () => {
  it("Checks all utility functions");
  describe("Get All shortcuts", () => {
    it("Gets all shortcuts without or with sort options of shortlink or description applied", async () => {
      const username = "vinay";
      const sort1 = "shortlink";
      const sort2 = "description";
      const resultAll = [
        {
          description: "Twitter trending and lovable page",
          tags: ["twitter", "love"],
          url: "https://twitter.com/trending/loves",
          O: "ab",
        },
        {
          description: "Linked In Page",
          tags: ["three"],
          url: "https://linkedin.com",
          O: "check123",
        },
        {
          description: "My Facebook page",
          tags: ["one", "two"],
          url: "https://facebook.com",
          O: "fb",
        },
        {
          description: "My Twitter page",
          url: "https://twitter.com",
          O: "twitter",
        },
      ];
      const resultSort1 = [
        {
          description: "Twitter trending and lovable page",
          tags: ["twitter", "love"],
          url: "https://twitter.com/trending/loves",
          O: "ab",
        },
        {
          description: "Linked In Page",
          tags: ["three"],
          url: "https://linkedin.com",
          O: "check123",
        },
        {
          description: "My Facebook page",
          tags: ["one", "two"],
          url: "https://facebook.com",
          O: "fb",
        },
        {
          description: "My Twitter page",
          url: "https://twitter.com",
          O: "twitter",
        },
      ];
      const resultSort2 = [
        {
          description: "Linked In Page",
          tags: ["three"],
          url: "https://linkedin.com",
          O: "check123",
        },
        {
          description: "My Facebook page",
          tags: ["one", "two"],
          url: "https://facebook.com",
          O: "fb",
        },
        {
          description: "My Twitter page",
          url: "https://twitter.com",
          O: "twitter",
        },
        {
          description: "Twitter trending and lovable page",
          tags: ["twitter", "love"],
          url: "https://twitter.com/trending/loves",
          O: "ab",
        },
      ];
      let responseData1 = await getAllShortcuts(username);
      let responseData2 = await getAllShortcuts(username, sort1);
      let responseData3 = await getAllShortcuts(username, sort2);
      expect(responseData1).to.eql(resultAll);
      expect(responseData2).to.eql(resultSort1);
      expect(responseData3).to.eql(resultSort2);
    });
  });
  describe("Get Shortcut Details", () => {
    it("Gets a shortcut details without or with search term of shortlink, description or tag", async () => {
      const username = "vinay";
      const shortlink = "ab";
      const description = "My Facebook";
      const tag = "one";
      const resultShortlink = {
        description: "Twitter trending and lovable page",
        tags: ["twitter", "love"],
        url: "https://twitter.com/trending/loves",
        O: "ab",
      };
      const resultDescription = [
        {
          description: "My Facebook page",
          tags: ["one", "two"],
          url: "https://facebook.com",
          O: "fb",
        },
      ];
      const resultTag = [
        {
          description: "My Facebook page",
          tags: ["one", "two"],
          url: "https://facebook.com",
          O: "fb",
        },
      ];

      expect(await getShortcutDetails(username, shortlink, "shortlink")).to.eql(
        resultShortlink
      );
      expect(
        await getShortcutDetails(username, description, "description")
      ).to.equal(resultDescription);
      expect(await getShortcutDetails(username, tag, "tag")).to.eql(resultTag);
    });
  });
  describe("Creates a shortlink", () => {
    it("Attempts to create a shortlink", async () => {
      const username = "vinay";
      const shortlink1Name = "ASDF";
      const shortlink1 = {
        url: "https://twitter.com/trending/loves",
        description: "Twitter trending and lovable page",
        tags: ["twitter", "love"],
      };
      const shortlink2Name = "asd#f";
      const shortlink2 = {
        url: "https://twitter.com/trending/loves",
        description: "Twitter trending and lovable page",
        tags: ["twitter", "love"],
      };
      const result12 = {
        message:
          "Shortlinks should be lowercase alphaneumeric with optional hyphens",
      };
      const shortlink3Name = "asdf";
      const shortlink3 = {
        url: "https://twitter.com/trending/loves",
        description: "Twitter trending and lovable page",
        tags: ["Twitter", "love"],
      };
      const result3 = {
        message:
          "tags must be lowercase alphaneumeric with optional hyphens and limited to maximum 20 characters",
      };
      const shortlink4Name = "asdf";
      const shortlink4 = {
        url: "https://twitter.com/trending/loves",
        description: "Twitter trending and lovable page",
        tags: ["twitter", "love"],
      };
      const result4 = {
        shortlink: "asdf",
        url: "https://twitter.com/trending/loves",
        description: "Twitter trending and lovable page",
        tags: ["twitter", "love"],
        message: "Successfully created shortlink",
      };
      expect(
        await createShortLink(username, shortlink1Name, shortlink1)
      ).to.eql(result12);
      expect(
        await createShortLink(username, shortlink2Name, shortlink2)
      ).to.eql(result12);
      expect(
        await createShortLink(username, shortlink3Name, shortlink3)
      ).to.eql(result3);
      expect(
        await createShortLink(username, shortlink4Name, shortlink4)
      ).to.eql(result4);
    });
  });
});
