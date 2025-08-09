const jwt = require('jsonwebtoken');
const User = require('../../models/userModel');
const ErrorHandler = require('../../utils/errorHandler');
const asyncErrorHandler = require('../helpers/asyncErrorHandler');

exports.isAuthenticatedUser = asyncErrorHandler(async (req, res, next) => {

    // Check for token in cookies first
    let token = req.cookies.token;

    // If no token in cookies, check Authorization header
    if (!token && req.headers.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7); // Remove 'Bearer ' prefix
        }
    }

    console.log("Token found:", token ? "Yes" : "No");
    console.log("Token source:", req.cookies.token ? "Cookie" : req.headers.authorization ? "Bearer" : "None");

    if (!token) {
        return next(new ErrorHandler("Please Login to Access", 401))
    }

    try {
        const decodedData = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decodedData.id);

        if (!req.user) {
            return next(new ErrorHandler("User not found", 401));
        }

        console.log("Authenticated user:", req.user.name, "Role:", req.user.role);
        next();
    } catch (error) {
        console.log("JWT verification error:", error.message);
        return next(new ErrorHandler("Invalid token", 401));
    }
});

exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {

        if (!roles.includes(req.user.role)) {
            return next(new ErrorHandler(`Role: ${req.user.role} is not allowed`, 403));
        }
        next();
    }
}