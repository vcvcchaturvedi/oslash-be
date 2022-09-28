import Express from "express";
import passport from "passport";
import dotenv from "dotenv";
import shortcuts from "../utils/shortcuts.js";
const getAllShortcuts = shortcuts.getAllShortcuts;
const getShortcutDetails = shortcuts.getShortcutDetails;
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
router.get("/users/shortcuts", async (req, res) => {
  const user = req.user;
  const username: string = (user as any).username;
  const shortcutsJSON = await getAllShortcuts(username);
  res.send(shortcutsJSON);
});
router.get("/users/shortcut", async (req, res) => {
  const user = req.user;
  const username: string = (user as any).username;
  const shortcut: string = req.query.q as string;
  const shortcutDetails = await getShortcutDetails(username, shortcut);
  res.status(200).send(shortcutDetails);
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
