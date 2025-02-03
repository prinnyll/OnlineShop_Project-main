const User = require("../models/user.model");
const authUtil = require("../util/authentication");
const validation = require("../util/validation");
const sessionFlash = require("../util/session-flash");

const getSignup = (req, res) => {
  let sessionData = sessionFlash.getSessionData(req);

  if (!sessionData) {
    sessionData = {
      email: "",
      confirmEmail: "",
      password: "",
      fullname: "",
      street: "",
      postal: "",
      city: "",
    };
  }

  res.render("customer/auth/signup", { inputData: sessionData });
};
const signup = async (req, res, next) => {
  const enteredData = {
    email: req.body.email,
    confirmEmail: req.body["confirm-email"],
    password: req.body.password,
    fullname: req.body.fullname,
    address: req.body.address,
    city: req.body.city,
  };

  if (
    !validation.userDetailsAreValid(
      req.body.email,
      req.body.password,
      req.body.fullname,
      req.body.address,
      req.body.city
    ) ||
    !validation.emailIsConfirmed(req.body.email, req.body["confirm-email"]) //confirm-email (-) can't be use as a property name like req.body.confirm-email if u want to use, use req.body.ConfirmEmail, also set html name="confirm-email" to name="ConfirmEmail"
  ) {
    sessionFlash.flashDataToSession(
      req,
      {
        errorMessage:
          "Please check your input, some fields are invalid or passwords do not match",
        ...enteredData,
      },
      () => {
        res.redirect("/signup");
      }
    );

    return;
  }

  const user = new User(
    req.body.email,
    req.body.password,
    req.body.fullname,
    req.body.address,
    req.body.city
  );

  try {
    const existsAlready = await user.existsAlready();

    if (existsAlready) {
      sessionFlash.flashDataToSession(
        req,
        {
          errorMessage: "User already exists",
          ...enteredData,
        },
        () => {
          res.redirect("/signup");
        }
      );

      return;
    }

    await user.signup();
    //
  } catch (error) {
    next(error);
    return;
  }

  res.redirect("/login");
};

const getLogin = (req, res) => {
  let sessionData = sessionFlash.getSessionData(req);

  if (!sessionData) {
    sessionData = {
      email: "",
      password: "",
    };
  }
  res.render("customer/auth/login", { inputData: sessionData });
};

const login = async (req, res, next) => {
  const user = new User(req.body.email, req.body.password);

  let existingUser;
  try {
    existingUser = await user.getUserWithSameEmail();
  } catch (error) {
    next(error);
    return;
  }

  const sessionErrorData = {
    errorMessage: "Invalid email or password - please try again",
    email: user.email,
    password: user.password,
  };

  if (!existingUser) {
    sessionFlash.flashDataToSession(req, sessionErrorData, () => {
      res.redirect("/login");
    });
    return;
  }

  const isPasswordCorrect = await user.comparePassword(existingUser.password);

  if (!isPasswordCorrect) {
    sessionFlash.flashDataToSession(req, sessionErrorData, () => {
      res.redirect("/login");
    });
    return;
  }

  authUtil.createUserSession(req, existingUser, () => {
    res.redirect("/");
  });
};

const logout = (req, res) => {
  authUtil.destroyUserAuthSession(req);
  res.redirect("/login");
};

module.exports = {
  getSignup: getSignup,
  getLogin: getLogin,
  signup: signup,
  login: login,
  logout: logout,
};
