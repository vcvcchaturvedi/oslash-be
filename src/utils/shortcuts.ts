import db from "../init.js";
import { ref, get, query, orderByChild, equalTo } from "firebase/database";
const getAllShortcuts = async (username: string) => {
  const snapshot = await get(ref(db, "users/" + username));
  if (snapshot.val()) {
    const shortcuts = snapshot.val().o;
    return shortcuts;
  } else return {};
};
const resolve = (path: any, obj = self, separator = ".") => {
  var properties = Array.isArray(path) ? path : path.split(separator);
  return properties.reduce((prev: any, curr: any) => prev?.[curr], obj);
};
const getShortcutDetails = async (username: string, shortcut: string) => {
  const snapshot = await get(ref(db, "users/" + username + "/o/" + shortcut));
  if (snapshot.val()) {
    const shortcutSnapshot = snapshot.val();
    try {
      const url = new URL(shortcutSnapshot.url);
      return shortcutSnapshot;
    } catch (err) {
      return {
        message: "Invalid shortcut specified or Shortcut does not exists",
      };
    }
  } else return { message: "Shortcut does not exist" };
};
export default { getAllShortcuts, getShortcutDetails };
