# Authentication

- user register on the server -> create account.
    - email
    - password

- these details saved on the database and a token is created by server.
- then the token is given back to the user.
- this token have information about the user.

- then user login.
- and in the login we also create a new token.
- also verify user token.

--- 

- Access token 
- refresh token

--- 
jb hm token localstorage ya cookie me store krwate han to vhan se ye accessible hota hai localstorage ko js direct acess kr skti hai or cookie ko execute kr skti hai

isliye token ko hm meory me rkhte hn ek variable me 

pr variable me problem hai ki jaise hi page reload hota hai token bhi ht jaaega.
isliye hm do token use krte han

1. access token : server is tokein ko pdke pta krta hai ki konsa user login kr rha hai. ye normal token ki tarah hota hai.
2. refresh token : refresh token me ek api hit hoti hai refresh. ye api hit hoti hai or iske liye refresh token compulsory hota hai. refresh token me server hmare token ko read krega and is token ke exchange me server hme return krta hai acess token.
and is refresh token ko hm cookies me store krte han kyonki refresh token ek nya acess token regenerate krwata hai uska kaam hota hai sirf access token ki generate krna na ki user authentication check krna.

access token : user can use any feature

refresh token : used to generate new acess token

access token expires in 15 minutes. jaise hi aceess token expire ho jaaega frontend se dubara ek call jaegi with refresh token for new access token.

refresh token expires in 7d.

--- 

also hm new ek api hit krwate han /refreshToken jo ki 15 minutes baad ek new access token generate krwati hai.

```js
export const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: "Unauthorised" });
  }

  const decoded = jwt.verify(refreshToken, jwt_secret);

  const accessToken = jwt.sign({ id: decoded.id }, jwt_secret, {
    expiresIn: "15m",
  });

  res
    .status(200)
    .json({ message: "Access token refreshed successfully", accessToken });
};

```

also for extra layer of security we need to implement extra functionality ki accesstoken ke saath hm erfresh token bhi new generate krenge.


```js
export const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: "Unauthorised" });
  }

  const decoded = jwt.verify(refreshToken, jwt_secret);

  const accessToken = jwt.sign({ id: decoded.id }, jwt_secret, {
    expiresIn: "15m",
  });

  const newRefreshToken = jwt.sign({ id: decoded.id }, jwt_secret, {
    expiresIn: "7d",
  });

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res
    .status(200)
    .json({ message: "Access token refreshed successfully", accessToken });
};

```

---
### Logout from all devices

- accessToken use krte han user