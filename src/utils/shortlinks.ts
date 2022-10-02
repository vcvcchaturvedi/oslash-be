import db from "../init.js";
import {
  ref,
  get,
  set,
  orderByChild,
  startAt,
  endAt,
  query,
} from "firebase/database";
import O from "../models/shortlink.js";
const getAllShortcuts = async (username: string, sort?: string) => {
  if (!sort) {
    const snapshot = await get(ref(db, "users/" + username + "/o"));
    if (snapshot.val()) {
      let finalData = [];
      for (const link in snapshot.val()) {
        let data = {
          ...snapshot.val()[link],
          O: link,
        };
        finalData.push(data);
      }
      return finalData;
    } else return {};
  }
  switch (sort) {
    case "shortlink":
      const snapshot = await get(ref(db, "users/" + username + "/o"));
      if (snapshot.val()) {
        const finalData = [];
        for (const link in snapshot.val()) {
          const data = { ...snapshot.val()[link], O: link };
          finalData.push(data);
        }
        finalData.sort((a, b) => a.O.localeCompare(b.O));
        return finalData;
      } else return {};
      break;
    case "description":
      try {
        const snapshotDescription = await get(
          query(ref(db, "users/" + username + "/o"))
        );
        const data = snapshotDescription.val();
        const finalData = [];
        for (const link in data) {
          const temp = { ...data[link], O: link };
          finalData.push(temp);
        }
        finalData.sort((a, b) => a.description.localeCompare(b.description));
        return finalData;
      } catch (err) {
        return { message: "No links found for this user" };
      }
      break;
    default:
      return { message: "This sort option is not available" };
  }
};
const getShortcutDetails = async (
  username: string,
  searchterm: string,
  match: string
) => {
  switch (match) {
    case "shortlink":
      const snapshotLink = await get(
        ref(db, "users/" + username + "/o/" + searchterm)
      );
      if (snapshotLink.val()) {
        const shortlinkSnapshot = snapshotLink.val();
        try {
          const url = new URL(shortlinkSnapshot.url);
          return { ...shortlinkSnapshot, O: searchterm };
        } catch (err) {
          return {
            message: "Invalid shortlink specified or Shortlink does not exists",
          };
        }
      } else return { message: "Shortlink does not exist" };
      break;
    case "description":
      try {
        const snapshotDescription = await get(
          query(
            ref(db, "users/" + username + "/o"),
            orderByChild("description"),
            startAt(`${searchterm}`),
            endAt(`${searchterm}\uf8ff`)
          )
        );
        if (snapshotDescription.val()) {
          const data = snapshotDescription.val();
          const finalData = [];
          for (const link in data) {
            const dataWithOName = {
              ...data[link],
              O: link,
            };
            finalData.push(dataWithOName);
          }
          return finalData;
        }
        return {
          message: "No such shortlink with the provided description found",
        };
      } catch (err) {
        console.log(err);
        return {
          message: "No such shortlink with the provided description found",
        };
      }
      break;
    case "tag":
      try {
        const snapshotLinks = await get(
          query(ref(db, "users/" + username + "/o"))
        );
        if (snapshotLinks.val()) {
          const links = snapshotLinks.val();
          const finalData = [];
          for (const link in links) {
            if (links[link].tags?.includes(searchterm))
              finalData.push({ ...links[link], O: link });
          }
          return finalData;
        }
        return {
          message: "No such shortlink with the provided tags found",
        };
      } catch (err) {
        console.log(err);
        return {
          message: "No such shortlink with the provided tags found",
        };
      }
      break;
    default:
      return { message: "Cannot find with this match term" };
  }
};
const createShortLink = async (
  username: string,
  shortlink: string,
  body: O
) => {
  const validationResponse = await shortlinkCreateValidator(
    username,
    shortlink,
    body.tags as Array<string>
  );
  if (!validationResponse.done) return { message: validationResponse.message };
  try {
    set(ref(db, "users/" + username + "/o/" + shortlink), body);
    return { shortlink, ...body, message: "Successfully created shortlink" };
  } catch (err) {
    return { message: "Shortlink not created, error in DB" };
  }
};
const shortlinkCreateValidator = async (
  username: string,
  shortlink: string,
  tags: Array<string>
) => {
  const regexLinkTest = /^[a-z0-9-/]+/g;
  const resultTestRegex = regexLinkTest.exec(shortlink);

  if (
    resultTestRegex &&
    resultTestRegex.length &&
    (resultTestRegex as any)[0] === shortlink
  ) {
    if (tags && tags.length > 0) {
      let flag = tags.some((tag) => {
        const regexTagTest = /^[a-z0-9-]{1,20}/g;
        const resultTagRegexTest = regexTagTest.exec(tag);
        if (!resultTagRegexTest || !resultTagRegexTest.length) return true;
        return !((resultTagRegexTest as any)[0] === tag);
      });
      if (flag)
        return {
          done: false,
          message:
            "tags must be lowercase alphaneumeric with optional hyphens and limited to maximum 20 characters",
        };
    }
    const snapshot = await get(
      ref(db, "users/" + username + "/o/" + shortlink)
    );
    if (
      snapshot.val() &&
      snapshot.val().url &&
      typeof snapshot.val().url === "string"
    ) {
      return { done: false, message: "Shortlink already exists" };
    }
    return { done: true };
  }
  return {
    done: false,
    message:
      "Shortlinks should be lowercase alphaneumeric with optional hyphens",
  };
};
export default {
  getAllShortcuts,
  getShortcutDetails,
  createShortLink,
};
