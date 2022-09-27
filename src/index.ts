import Express from "express";
import * as Passport from "./passport.js";
import db from "./init.js";
import {ref,get, child} from "firebase/database";
const dbRef = ref(db);
get(child(dbRef,"users")).then(snapshot=>{
    console.log(snapshot.val());
})
