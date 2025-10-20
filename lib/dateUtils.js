/**
 * Generate a timestamp string in the format: YYYY-MM-DD HH:mm:ss.SSS
 * Uses local time with Cairo timezone (UTC+2)
 * Adds 1 hour to system time to match actual Cairo time
 * @returns {string} Formatted timestamp
 */
function getLocalTimestamp() {
    const now = new Date();
    
    // Add 1 hour to system time to get correct Cairo time
    // (System appears to be running in UTC+1, need to add 1 more hour)
    const cairoTime = new Date(now.getTime() + (1 * 60 * 60 * 1000));
    
    const year = cairoTime.getFullYear();
    const month = String(cairoTime.getMonth() + 1).padStart(2, '0');
    const day = String(cairoTime.getDate()).padStart(2, '0');
    const hours = String(cairoTime.getHours()).padStart(2, '0');
    const minutes = String(cairoTime.getMinutes()).padStart(2, '0');
    const seconds = String(cairoTime.getSeconds()).padStart(2, '0');
    const milliseconds = String(cairoTime.getMilliseconds()).padStart(3, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
}

module.exports = {
    getLocalTimestamp
};
