const isEmpty = (value) => {
  return !value || value.trim() === "";
};

const userCredentialsAreValid = (email, password) => {
  return (
    email && email.includes("@") && password && password.trim().length >= 6
  );
};

const userDetailsAreValid = (email, password, name, address, city) => {
  return (
    userCredentialsAreValid(email, password) &&
    !isEmpty(name) &&
    !isEmpty(address) &&
    !isEmpty(city)
  );
};

const emailIsConfirmed = (email, confirmEmail) => {
  return email === confirmEmail;
};

module.exports = {
  userDetailsAreValid: userDetailsAreValid,
  emailIsConfirmed: emailIsConfirmed,
};
