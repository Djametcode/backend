const User = require("../model/userModel");

const registUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      return res.status(201).json({ msg: "Please fill requipment" });
    }

    const user = await User.create({ ...req.body });

    return res.status(200).json({ msg: "Success Regist", user });
  } catch (error) {
    console.log(error);
    return res.status(501).json({ msg: "Internal server error" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(201).json({ msg: "Please fill requipment" });
    }

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const isPassCorrect = await user.comparePass(password);

    if (!isPassCorrect) {
      return res.status(201).json({ msg: "Password wrong !" });
    }

    const token = await user.createJWT();

    return res.status(200).json({ msg: "Success Login", user, token });
  } catch (error) {
    console.log(error);

    return res.status(501).json({ msg: "Internal server error" });
  }
};

module.exports = { registUser, loginUser };
