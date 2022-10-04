import Express from "express";
import passport from "passport";
import dotenv from "dotenv";
import shortlinks from "../utils/shortlinks";
import O from "../models/shortlink";
import db from "../init";
import { get, set, ref, orderByChild, equalTo, query } from "firebase/database";
import bcrypt from "bcrypt";
import User from "../models/user";
import * as EmailValidator from "email-validator";
const getAllShortcuts = shortlinks.getAllShortcuts;
const getShortcutDetails = shortlinks.getShortcutDetails;
const createShortLink = shortlinks.createShortLink;
dotenv.config();
const router = Express.Router();
router.post("/register", async (req, res) => {
  let { username, ...bodyRequest } = req.body;
  if (!username || username.length == 0)
    return res.send({ message: "Please provide a username to register" });
  if (!bodyRequest.email || !bodyRequest.email.length)
    return res.send({ message: "Please provide an email" });
  username = username.toLowerCase();
  try {
    const snapshot = await get(ref(db, "users/" + username + "/email"));
    if (snapshot.val()) return res.send({ message: "User already exists" });
  } catch (err) {}
  try {
    const snapshot = await get(
      query(ref(db, "users"), orderByChild("email"), equalTo(bodyRequest.email))
    );
    if (snapshot.val()) {
      return res.send({
        message:
          "Email id already in use, please use another email id to regsiter",
      });
    }
  } catch (err) {}
  const user: User = bodyRequest as User;

  if (!EmailValidator.validate(user.email))
    return res.send({ message: "Please provide a valid emailid" });
  if (!user.password || !user.password.length || user.password.length > 20)
    return res.send({
      message: "Please provide a password with maximum 20 characters",
    });
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    user.password = hashedPassword;
  } catch (err) {
    return res
      .status(500)
      .send({ message: "Internal server error in creating profile" });
  }
  try {
    await set(ref(db, "users/" + username), user);
    res.send({ message: "created profile for username: " + username });
  } catch (err) {
    res
      .status(500)
      .send({ message: "Internal server error in creating profile" });
  }
});
router.post("/login", (req, res, next) => {
  passport.authenticate("local", { session: true }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({
        message: info ? info.message : "Login failed",
        user: user,
      });
    }

    req.login(user, { session: true }, (err) => {
      if (err) {
        console.log(err);
        return res.send(err);
      }
      req.session.cookie = user;

      return res.status(200).send({ username: user.username });
    });
  })(req, res, next);
});
router.use("/users", async (req, res, next) => {
  if (req.isAuthenticated()) next();
  else res.status(401).send("Not authorized");
});
router.get("/users/shortlinks", async (req, res) => {
  const user = req.user;
  const username: string = (user as any).username;
  const shortlinksJSON = await getAllShortcuts(
    username,
    req.query?.sort as any
  );
  res.send(shortlinksJSON);
});
router.get("/users/shortlink", async (req, res) => {
  const user = req.user;
  const username: string = (user as any).username;
  const shortlink: string = req.query.q as string;
  const match: string = req.query.match as string;
  const shortlinkDetails = await getShortcutDetails(username, shortlink, match);
  res.status(200).send(shortlinkDetails);
});
router.post("/users/shortlink", async (req, res) => {
  let { shortlink, ...bodyRequest } = req.body;
  const body: O = bodyRequest;
  if (!body.url)
    return res.send({
      message:
        "Please provide the URL for which the shortlink has to be created",
    });
  try {
    const url = new URL(body.url as string);
  } catch (err) {
    return res.send({ message: "URL should be a valid URL" });
  }
  if (!body.description || !body.description.length)
    return res.send({ message: "Please include a shortlink description" });
  const user = req.user;
  const username: string = (user as any).username;
  res.send(await createShortLink(username, shortlink, body));
});
router.delete("/users/shortlink", async (req, res) => {
  const shortlink: string = req.query.q as string;
  const user = req.user;
  const username: string = (user as any).username;
  try {
    const snapshot = await get(
      ref(db, "users/" + username + "/o/" + shortlink)
    );
    if (!snapshot.val()) {
      return res.send({ message: "No such shortlink exists" });
    }
    let refSnapshot = snapshot.ref;
    await set(refSnapshot, null);
    res.send({ message: "Successfully deleted shortlink" });
  } catch (err) {
    res.status(503).send({ message: "Unable to delete the shortlink" });
  }
});
router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.status(200).send({ message: "Logged out" });
  });
});
export default router;
