const express = require("express");
const app = express();
const port = 5000;
const bodyParser = require("body-parser");
const { User } = require("./models/User");

/*
    bodyParser는 클라이언트에서 오는 정보를 서버에서 받을 수 있도록 하는 라이브러리
    
    //  app.use(bodyParser.urlencoded({extended: true})) 
    //  이 코드는 application/x-www/form-urlencoded 형식으로 된 데이터를 읽을 수 있도록 한다. 

    //  app.use(bodyParser.json())
    //  이 코드는 application/json 형식으로 된 데이터를 읽을 수 있도록 한다. 
*/
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const mongoose = require("mongoose");
mongoose
  .connect(
    "mongodb+srv://jeff-lee:qwer1234@cluster.zczw9oy.mongodb.net/?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB Connected.."))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/register", (req, res) => {
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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
