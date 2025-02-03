const multer = require("multer");
const uuid = require("uuid").v4;

const upload = multer({
  storage: multer.diskStorage({
    destination: "product-data/images",
    filename: (req, file, cb) => {
      cb(null, uuid() + "-" + file.originalname);
    },
  }),
});

upload.single("image");

const configuredMulterMiddleware = upload.single("image");

module.exports = configuredMulterMiddleware;
