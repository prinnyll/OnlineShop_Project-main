const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.render("customer/home/index");
});

router.get("/about", (req, res) => {
  res.render("customer/about/about");
});

router.get("/401", (req, res) => {
  res.status(401).render("shared/401");
});

router.get("/403", (req, res) => {
  res.status(403).render("shared/403");
});

module.exports = router;
