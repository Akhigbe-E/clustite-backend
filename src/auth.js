
module.exports = getAuthId = async (redisClient, authorization) => {
    const value = await redisClient.get(authorization)
    return value
}


// module.exports = getAuthId = (redisClient, db, authorization) => {
//     return Promise.resolve(redisClient.get(authorization, (err, reply) => {
//         if (err || !reply) {
//             return null
//         } else {
//             return { id: reply }
//         }
//     }))
// }

