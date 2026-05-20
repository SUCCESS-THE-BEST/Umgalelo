const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const userModel = require('../models/user');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/api/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails[0].value;

        let [user] = await userModel.findUserByEmail(email);

        if (!user) {
            await userModel.createUser(
                profile.name.givenName,
                profile.name.familyName,
                email,
                null,
                null,
                null
            );

            [user] = await userModel.findUserByEmail(email);
        }

        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
}));

module.exports = passport;