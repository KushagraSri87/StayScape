const User = require("../models/user");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async(req, res, next) => {
    try{
        let { username, email, password } = req.body;
        const newUser = new User({email, username});
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, (err) => {  // it is used for directly login after any user completes sign up.
            if(err){                  
                return next(err);
            }
            req.flash("success", "Welcome to Wanderlust");
            res.redirect("/listings");
        })
        
    }catch(e){
        req.flash("error", e.message);
        res.redirect("/signup");
    };
    
};


module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {  
    req.flash("success", "Welcome back to Wanderlust!");
    let redirectUrl = res.locals.redirectUrl || "/listings";    
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {                 // if error will occur then store in err(parameter) if not then err is empty
        if(err){
            return next(err);
        }
        req.flash("success", "Your are logged out now");
        res.redirect("/listings");
    })
};