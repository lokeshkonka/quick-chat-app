import User from './../models/User.js';
import jwt from 'jsonwebtoken';

export const protectRoute = async (req, res, next) => {
    try {
        const headerToken = req.headers.token;
        const authHeader = req.headers.authorization;
        const bearerToken = authHeader?.startsWith("Bearer ")
            ? authHeader.slice(7)
            : null;
        const token = headerToken || bearerToken;
        if (!token) {
            return res.status(401).json({ success: false, message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User Not Found" });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};
