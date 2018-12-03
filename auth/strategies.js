const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const { Strategy: JWTStrategy, ExtractJwt } = require('passport-jwt');

const { JWT_SECRET } = require('../config');
const User = require('../models/user');

const localStrategy = new LocalStrategy(async(username, password, done) => {
  try {
    const user = await User.findOne({ username });
    if (!user || !user.authenticateUser(password)) {
      return done(null, false);
    } 
    return done(null, user);
    } catch(e) {
      return done(e, false);
    }
});

const JwtStrategy = new JWTStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
    secretOrKey: JWT_SECRET
  },
  async(payload, done) => {
    try {
      const user = await User.findById(payload.user.id);
      if (!user) {
        return done(null, false);
      }
      return done(null, user);
    } catch (e) {
      return done(e, false);
    }
  }
);

passport.use(localStrategy);
passport.use(JwtStrategy);

const authLocal = passport.authenticate('local', { session: false });
const authJwt = passport.authenticate('jwt', { session: false });

module.exports = { authLocal, authJwt };
