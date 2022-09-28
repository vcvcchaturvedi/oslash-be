import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import User from "./models/user.js";
import db from "./init.js";
import { get, ref, query, orderByChild, equalTo } from "firebase/database";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();
const dbRef = ref(db, "users");

const localLogin = new LocalStrategy({ usernameField: "email" }, function (
  username: string,
  password: string,
  cb: any
) {
  get(query(dbRef, orderByChild("email"), equalTo(username))).then(
    (userSnapshot) => {
      const user: any = userSnapshot.val();
      const usernameKey = Object.keys(user)[0];
      if (user) {
        if (!bcrypt.compareSync(password, user[usernameKey].password))
          return cb(null, false, { message: "Incorrect Password" });
        return cb(
          null,
          { username: Object.keys(user)[0] },
          { message: "Logged in successfully" }
        );
      } else return cb(null, false, { message: "Email id is not registered" });
    }
  );
});

export function init() {
  passport.use(localLogin);
}
