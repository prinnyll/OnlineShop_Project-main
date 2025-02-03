const bcrypt = require("bcryptjs");
const { ObjectId } = require("mongodb");
const db = require("../data/database");

class User {
  constructor(email, password, fullname, address, city) {
    this.email = email;
    this.password = password;
    this.name = fullname;
    this.addressGp = { address: address, city: city };
  }

  static findById(userId) {
    const uid = ObjectId.createFromHexString(userId);
    return db
      .getDb()
      .collection("users")
      .findOne(
        { _id: uid },
        {
          projection: { password: 0 },
        }
      );
  }

  getUserWithSameEmail() {
    return db.getDb().collection("users").findOne({ email: this.email });
  }

  async existsAlready() {
    const existingUser = await this.getUserWithSameEmail();
    if (existingUser) {
      return true;
    }
    return false;
  }

  async signup() {
    const hashedPassword = await bcrypt.hash(this.password, 12);

    await db.getDb().collection("users").insertOne({
      email: this.email,
      password: hashedPassword,
      name: this.name,
      address: this.addressGp,
    });
  }

  comparePassword(hashedPassword) {
    return bcrypt.compare(this.password, hashedPassword);
  }
}

module.exports = User;
