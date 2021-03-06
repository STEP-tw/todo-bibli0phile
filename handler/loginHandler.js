const DefaultHandler = require('./defaultHandler.js');

class LoginHandler extends DefaultHandler{
  constructor(allUrl) {
    super();
    this.allUrl = allUrl;
  }

  getValid(url){
    return this.allUrl.includes(url);
  }

  execute(req,res){
    if(this.getValid(req.url) && !(req.userName)) {
      res.redirect('/login');
      res.end();
    }
  }

}
module.exports = LoginHandler;
