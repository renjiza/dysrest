const pool = require('../config/database');

exports.update = async (req, reply) => {
    const input = req.body
    try {
        const db = await pool.getConnection()
        const sql = `UPDATE user SET userNotificationPrivilege = ? WHERE userId = ?`
        const res = await db.query(sql, [
            input.userNotificationPrivilege,
            input.user,
        ])
        if (res.affectedRows === 1) {
            reply.send({
                status: 200,
                error: null,
                response: `Preferensi berhasil diperbarui`,
            })            
        } else {
            reply.send({
                status: 200,
                error: null,
                response: null,
            })
        }
        db.end()
    } catch (err) {
        console.log(err)
    }
}