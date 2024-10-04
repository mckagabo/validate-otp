const redisClient = redis.createClient({
    url: process.env.REDIS_URL // Set up Redis URL in your environment variables
});
redisClient.connect();

module.exports = async function(req, res) {
    try {
        const userId = req.payload.userId;  // Get userId from request payload
        const inputOtp = req.payload.otp;   // Get OTP from request payload

        // 1. Retrieve the OTP from Redis cache
        const cachedOtp = await redisClient.get(`otp:${userId}`);

        if (!cachedOtp) {
            return res.json({ success: false, message: 'OTP has expired or does not exist.' });
        }

        // 2. Compare the OTP
        if (cachedOtp !== inputOtp) {
            return res.json({ success: false, message: 'Invalid OTP.' });
        }

        // Optionally, delete the OTP from the cache after it is validated
        await redisClient.del(`otp:${userId}`);

        return res.json({ success: true, message: 'OTP is valid.' });
    } catch (error) {
        console.error('Error:', error);
        return res.json({ success: false, message: 'Error validating OTP', error });
    }
};