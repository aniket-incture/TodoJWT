service AuthService {

   action register(email: String, password: String, name:String) returns {
    ID: UUID;
    email: String;
    name:String;
  };

  action login(email : String, password : String)
    returns {
      accessToken  : String;
      refreshToken : String;
    };

  action refresh(refreshToken : String)
    returns {
      accessToken : String;
      refreshToken : String;
    };

  action logout();
}
