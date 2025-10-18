DevTinder API

authRouter
- GET /signup
- POST /login
- POST /logout

profileRouter
- GET /profile/view
- PATCH /profile/edit
- PATCH /profile/password                     //forgot password

connectionRequestRouter
- POST /request/send/intrested/:userId
- POST /request/send/ignored/:userId

- POST /request/review/accepted/:userId
- POST /request/review/rejected/:userId

userRouter
- GET /user/connections
- GET /user/request/recieved
- GET /user/feeds                 //gets all the profiles of other ppl to swipe right and left
