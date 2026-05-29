require('dotenv').config();

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const userModel = require('../models/user');
const notificationModel = require('../models/notifications');

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`
        },

        async (accessToken, refreshToken, profile, done) => {
            try {
                const googleId = profile.id;

                const email =
                    profile.emails?.[0]?.value || null;

                const profilePhoto =
                    profile.photos?.[0]?.value || null;

                const firstName =
                    profile.name?.givenName || 'Google';

                const lastName =
                    profile.name?.familyName || 'User';

                if (!email) {
                    return done(null, false, {
                        message: 'Google account has no email'
                    });
                }

                const existingGoogleUser =
                    await userModel.findUserByGoogleId(googleId);

                if (existingGoogleUser.length > 0) {
                    return done(null, existingGoogleUser[0]);
                }

                const existingEmailUser =
                    await userModel.findUserByEmail(email);

                if (existingEmailUser.length > 0) {
                    await userModel.linkGoogleToExistingUser(
                        existingEmailUser[0].user_id,
                        googleId,
                        profilePhoto
                    );

                    const updatedUser =
                        await userModel.findUserByEmail(email);

                    return done(null, updatedUser[0]);
                }

                await userModel.createGoogleUser(
                    firstName,
                    lastName,
                    email,
                    googleId,
                    profilePhoto
                );

                const newUser =
                    await userModel.findUserByEmail(email);

                await notificationModel.createNotification(
                    newUser[0].user_id,
                    null,
                    'Welcome to Umgalelo, complete your profile to get started',
                    'welcome'
                );

                return done(null, newUser[0]);

            } catch (err) {
                return done(err, null);
            }
        }
    )
);

module.exports = passport;