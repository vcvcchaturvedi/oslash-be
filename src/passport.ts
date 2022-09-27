import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, 
function (email: string, password: string, cb: any) {
    
    
}
));