const {login} = require("../controllers/userController")
const {register} = require("../controllers/userController")
const {checkUserSession} = require("../controllers/userController")

const router = require("express").Router();

router.post("/login", login);
router.post("/register", register);
router.post("/session-auth", checkUserSession);

module.exports = router;
