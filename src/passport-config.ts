import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import User from "./models/user.js";
import db from "./init.js";
import { get, ref, query, orderByChild, equalTo } from "firebase/database";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();
const dbRef = ref(db, "users");

const localLogin = new LocalStrategy(function (
  username: string,
  password: string,
  cb: any
) {
  get(query(dbRef, orderByChild("email"), equalTo(username))).then(
    (userSnapshot) => {
      const user: Array<User> = userSnapshot.val();
      if (user && user.length == 1) {
        if (!bcrypt.compareSync(password, user[0].password))
          return cb(null, false, { message: "Incorrect Password" });
        return cb(
          null,
          { email: user[0].email },
          { message: "Logged in successfully" }
        );
      } else return cb(null, false, { message: "Email id is not registered" });
    }
  );
});

export function init() {
  passport.use(localLogin);
}
