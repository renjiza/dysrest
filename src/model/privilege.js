const pool = require('../config/database');
const auth = require('./auth');

const label = "userEmail";

exports.get = async (req, reply) => {
    let res
    try {
        const db = await pool.getConnection()
        const input = req.query
        const column = input.column && input.column !== '' ? ` ${input.column} ` : '*'
        const filter = input.filter && input.filter !== '' ? ` AND ${input.filter} ` : ''
        const order = input.order && input.order !== '' ? ` ORDER BY ${input.order} ${input.sort} ` : ''
        const limit = input.limit && input.limit !== '' ? ` LIMIT ${input.limit} ` : ''
        const offset = input.offset && input.offset !== '' ? ` OFFSET ${input.offset} ` : ''
        const sql = `SELECT
                        ${column}
                    FROM privilege
                    INNER JOIN user ON userId = privilegeUserId AND userActive = 1 AND userClientId = '${input.client}'
                    WHERE 1 = 1
                    ${filter} 
                    ${order}
                    ${limit}
                    ${offset}`
        res = await db.query(sql)
        if (res.length > 0) {            
            reply.send({
                status: 200,
                error: null,
                response: res,
            })
        } else {
            reply.send({
                status: 200,
                error: null,
                response: [],
            })
        }
        db.end()
    } catch (err) {
        console.log(err)
    }
}

exports.getById = async (req, reply) => {
    try {
        const db = await pool.getConnection()
        const id = req.params.id
        const input = req.query
        const column = input.column && input.column !== '' ? input.column : '*'
        const sql = `SELECT 
                    ${column}
                    FROM privilege
                    INNER JOIN user ON userId = privilegeUserId
                    WHERE privilegeUserId = ${id}`
        const res = await db.query(sql)
        if (res.length > 0) {
            reply.send({
                status: 200,
                error: null,
                response: res[0],
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

exports.update = async (req, reply) => {
    const input = req.body
    try {
        const db = await pool.getConnection()
        const isAllow = await auth.isAllow(input.user, "privilege", "edit")
        if (isAllow) {
            const sql = `call privilegeUpdate(?,?,?,?)`
            const res = await db.query(sql, [
                input.userId,
                input.privilegeArrayMenuId,
                input.user,
                input.logDetail,
            ])
            if (res[0][0].status === 1) {
                if (req.connected[input.userId]) {
                    req.connected[input.userId].emit('privilege updated', {
                        itId: input.user,
                        message: `Hak akses kamu baru saja diperbarui oleh ${input.fullname}`,
                    })
                }
                reply.send({
                    status: 200,
                    error: null,
                    response: `Akses User "${input[label]}" berhasil diperbarui`,
                })            
            } else {
                reply.send({
                    status: 200,
                    error: null,
                    response: null,
                })
            }
        } else {
            reply.send({
                status: 200,
                error: `Akses User "${input[label]}" gagal diubah, karena anda tidak lagi mempunyai akses "edit" pada menu ini`,
                response: null,
            })
        }
        db.end()
    } catch (err) {
        console.log(err)
    }
}