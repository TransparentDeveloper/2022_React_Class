const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10; //salt를 이용해서 비밀번호를 암호화한다. 그때 salt의 자리수를 지정하는게 saltround
const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    trim: true,
  },
  password: {
    type: String,
    maxlength: 5,
  },
  lastname: {
    type: String,
    maxlength: 50,
  },
  role: {
    type: Number,
    default: 0,
  },
  image: String,
  token: {
    type: String,
  },
  tokenExp: {
    type: Number,
  },
});

userSchema.pre("save", function (next) {
  var user = this;

  // password가 수정될 때만 암호화 할거임.
  if (user.isModified("password")) {
    //save 메서드 호출 전에 하는 메소드 지정
    //비밀번호를 암호화 한다.
    bcrypt.genSalt(saltRounds, function (err, salt) {
      // salt를 만듬
      if (err) return next(err); // 만드는데 에러나면 그냥 save 함수 실행시킴
      bcrypt.hash(user.password, salt, function (err, hash) {
        //hash는 인자로 순수한 password 값과 salt를 받아 암호화된 hash를 만듦
        if (err) return next(err);
        user.password = hash;
        next(); //다하면 save 메소드를 실행한다.
      });
    });
  } else {
    //아니면 그냥 나가라
    // next() 없으면 계속 이 안에서 머뭄
    next();
  }
});
userSchema.methods.comparePassword = function (plainPassword, cb) {
  // 만약 painPassword는 1234, db에 있는 암호화된 password는 $2b$10$TkvTov22wBGsBMoF0Z3qmeVRfrQaDHM05kiNXvW/5C.JUuTekgBpG
  // 이미 암호화 된 password를 복호화 할수 없다. 1234를 같은 방법으로 암호화해서 비교해야 한다.
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};
const User = mongoose.model("User", userSchema);

module.exports = { User };
