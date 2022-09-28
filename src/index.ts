import Express from "express";
import passport from "passport";
import * as passportConfig from "./passport-config.js";
import db from "./init.js";
import dotenv from "dotenv";
import session from "express-session";
import cookieParser from "cookie-parser";
import { ref, get } from "firebase/database";
import router from "./routes/auth.js";
import bodyParser from "body-parser";
const dbRef = ref(db, "users");
dotenv.config();
const PORT = process.env.PORT || 8000;
const app = Express();
app.use(
  session({
    name: "_oslash",
    secret: process.env.JWT_KEY as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: false,
      sameSite: "none",
      secure: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
passportConfig.init();
app.use((req, res, next) => {
  res.append("Access-Control-Allow-Origin", ["*"]);
  res.append("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.append(
    "Access-Control-Allow-Headers",
    "Content-Type,Origin,Accept,Authorization"
  );
  next();
});
app.use(cookieParser(process.env.JWT_KEY));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user: any, done) => {
  get(ref(db, "users/" + user.username)).then((userSnapshot) => {
    if (userSnapshot.val()) {
      return done(null, { username: user.username });
    } else {
      return done(null, false);
    }
  });
});
app.use("/", router);

app.use((err: any, req: any, res: any, next: any) => {
  if (res.headersSent) {
    return next(err);
  }
  console.error(err);
  res
    .status(500)
    .send("Something broke and we are on it! Sorry for the trouble :)");
});
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
export default app;
