import Express from "express";
import passport from "passport";
import dotenv from "dotenv";
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

      return res.status(200).send({ email: user.email });
    });
  })(req, res, next);
});
router.use("/users", async (req, res, next) => {
  if (req.isAuthenticated()) next();
  else res.status(401).send("Not authorized");
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
