const rateLimit = require('express-rate-limit')

//limit to 5 uploads/min per IP
const uploadLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, //1 min window
    max: 5, //limit each IP to 5 requests per window
    message: {
        status: 429,
        error: 'Too many uploads from this IP. Please try again later.'
    }
})

module.exports = uploadLimiter