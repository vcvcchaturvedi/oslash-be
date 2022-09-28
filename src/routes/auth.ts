import Express from "express";
import passport from "passport";
import dotenv from "dotenv";
import shortlinks from "../utils/shortlinks.js";
import O from "../models/shortlink.js";
const getAllShortcuts = shortlinks.getAllShortcuts;
const getShortcutDetails = shortlinks.getShortcutDetails;
const createShortLink = shortlinks.createShortLink;
const shortlinkCreateValidator = shortlinks.shortlinkCreateValidator;
dotenv.config();
const router = Express.Router();
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
  const shortlinksJSON = await getAllShortcuts(username);
  res.send(shortlinksJSON);
});
router.get("/users/shortlink", async (req, res) => {
  const user = req.user;
  const username: string = (user as any).username;
  const shortlink: string = req.query.q as string;
  const shortlinkDetails = await getShortcutDetails(username, shortlink);
  res.status(200).send(shortlinkDetails);
});
router.post("/users/shortlink", async (req, res) => {
  let { shortlink, ...body } = req.body;
  const user = req.user;
  const username: string = (user as any).username;
  res.send(await createShortLink(username, shortlink, body));
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
