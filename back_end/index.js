const express = require("express");
const app = express();
const port = 5000;
const bodyParser = require("body-parser");
const cookiParser = require("cookie-parser");
const { User } = require("./models/User");
const { auth } = require("./middleware/auth");

const config = require("./config/key");

/*
    bodyParser는 클라이언트에서 오는 정보를 서버에서 받을 수 있도록 하는 라이브러리
    
    //  app.use(bodyParser.urlencoded({extended: true})) 
    //  이 코드는 application/x-www/form-urlencoded 형식으로 된 데이터를 읽을 수 있도록 한다. 

    //  app.use(bodyParser.json())
    //  이 코드는 application/json 형식으로 된 데이터를 읽을 수 있도록 한다. 
*/
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookiParser());

const mongoose = require("mongoose");
mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected.."))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/api//register", (req, res) => {
  // 회원가입할때 필요한 정보들을 클라이언트에서 가져오면
  // 그것들을 데이터베이스에 넣어준다.

  // model instance를 만든다.
  // user 에 클라에서 온 정보가 들어있다.
  const user = new User(req.body);
  /*
   req.body에 들어 있는 거 

   {
    id: "hello",
    password: "123"
   }
  */

  /*
    mongodb에 저장할 건데, 
    저장에 실패하면 실패했다는 정보 + 에러정보를 클라에 전달
    저장에 성공하면 성공했다는 정보를 클라에 전달
   */
  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({
      success: true,
    });
  });
});

app.post("/api/login", (req, res) => {
  //요청된 이메일을 데이터베이스에서 있는지 찾는다.
  User.findOne({ email: req.body.email }, (err, user) => {
    //findOne은 몽고에서 제공하는 함수
    if (!user) {
      //이메일이 없다면
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다.",
      });
    }
    //요청된 이메일이 데이터베이스에 있다면, 비밀번호가 맞는지 확인한다.
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        //비밀번호가 맞지 않다면
        return res.json({
          loginSuccess: false,
          message: "비밀번호가 틀렸습니다.",
        });

      //비밀번호까지 맞다면, 해당 유저를 위한 토큰을 생성한다.
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);
        //토큰을 저장한다. 어디에? 쿠키 or 로컬스토리지
        //여기선 쿠기에 한다.
        res
          .cookie("x_auth", user.token)
          .status(200)
          .json({ loginSuccess: true, userId: user._id });
      });
    });
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// role 1 -> 관리자
// role 2 -> 일반유저

app.get("/api/users/auth", auth, (req, res) => {
  // 여기까지 middleware를 통과해 왔다는 얘기는 Authentication이 True 라는 말
  res.status(200).json({
    _id: req.user.id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  });
});

app.get("/api/users/auth", auth, (req, res) => {
  // id로 db에서 유저를 찾아서 token을 지워준다.
  User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, user) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).send({
      success: true,
    });
  });
});
