import db from "../init.js";
import { ref, get, set } from "firebase/database";
import O from "../models/shortlink.js";
import { triggerAsyncId } from "async_hooks";
const getAllShortcuts = async (username: string) => {
  const snapshot = await get(ref(db, "users/" + username));
  if (snapshot.val()) {
    const shortlinks = snapshot.val().o;
    if (shortlinks) return shortlinks;
    return {};
  } else return {};
};
const getShortcutDetails = async (username: string, shortlink: string) => {
  const snapshot = await get(ref(db, "users/" + username + "/o/" + shortlink));
  if (snapshot.val()) {
    const shortlinkSnapshot = snapshot.val();
    try {
      const url = new URL(shortlinkSnapshot.url);
      return shortlinkSnapshot;
    } catch (err) {
      return {
        message: "Invalid shortlink specified or Shortlink does not exists",
      };
    }
  } else return { message: "Shortlink does not exist" };
};
const createShortLink = async (
  username: string,
  shortlink: string,
  body: O
) => {
  const validationResponse = await shortlinkCreateValidator(
    username,
    shortlink,
    body.tags
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
