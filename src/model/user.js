const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const auth = require('./auth');

const label = "userFullname";

exports.get = async (req, reply) => {
    let res
    try {
        const db = await pool.getConnection()
        const input = req.query
        //params
        const column = input.column && input.column !== '' ? ` ${input.column} ` : '*'
        const filter = input.filter && input.filter !== '' ? ` AND ${input.filter} ` : ''
        const order = input.order && input.order !== '' ? ` ORDER BY ${input.order} ${input.sort} ` : ''
        const limit = input.limit && input.limit !== '' ? ` LIMIT ${input.limit} ` : ''
        const offset = input.offset && input.offset !== '' ? ` OFFSET ${input.offset} ` : ''
        const sql = `SELECT
                        ${column}
                    FROM user
                    WHERE userActive = 1
                    AND userSuper = 0
                    AND userClientId = '${input.client}'
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
                    FROM user
                    WHERE userId = ${id}`
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

exports.create = async (req, reply) => {
    const input = req.body
    try {
        const db = await pool.getConnection()    
        const isAllow = await auth.isAllow(input.user, "user", "add")
        if (isAllow) {
            const sql = `call userCreate(?,?,?,?,?,?,?)`
            const res = await db.query(sql, [
                input.client, 
                input.branch, 
                input.userEmail, 
                bcrypt.hashSync(input.userPassword, 10), 
                input.userFullname, 
                input.user,            
                input.logDetail,
            ])
            if (res[0][0].status === 1) {
                reply.send({
                    status: 200,
                    error: null,
                    response: `User "${input[label]}" berhasil dibuat`,
                })            
            } else {
                reply.send({
                    status: 200,
                    error: res,
                    response: null,
                })
            }
        } else {
            reply.send({
                status: 200,
                error: `User "${input[label]}" gagal dibuat, karena anda tidak lagi mempunyai akses "add" pada menu ini`,
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
        const isAllow = await auth.isAllow(input.user, "user", "edit")
        if (isAllow) {            
            const sql = `call userUpdate(?,?,?,?,?,?)`
            const res = await db.query(sql, [
                input.userId,
                input.userEmail,
                input.userPassword,
                input.userFullname,
                input.user,
                input.logDetail,
            ])
            if (res[0][0].status === 1) {
                console.log(req.connected, input.userId)
                if (req.connected[input.userId]) {
                    req.connected[input.userId].emit('user updated', {
                        itId: input.user,
                        message: `Data user kamu baru saja diperbarui oleh ${input.fullname}`,
                    })
                }
                reply.send({
                    status: 200,
                    error: null,
                    response: `User "${input[label]}" berhasil diperbarui`,
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
                error: `User "${input[label]}" gagal diubah, karena anda tidak lagi mempunyai akses "edit" pada menu ini`,
                response: null,
            })
        }
        db.end()
    } catch (err) {
        console.log(err)
    }
}

exports.delete = async (req, reply) => {
    const id = req.params.id
    const input = req.query
    try {
        const db = await pool.getConnection()        
        const isAllow = await auth.isAllow(input.user, "user", "delete")
        if (isAllow) {
            const sql = `call userDelete(?,?)`
            const res = await db.query(sql, [
                id,
                input.user,
            ])
            if (res[0][0].status === 1) {
                reply.send({
                    status: 200,
                    error: null,
                    response: `User "${input.info}" berhasil dihapus`,
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
                error: `User "${input.info}" gagal dihapus, karena anda tidak lagi mempunyai akses "delete" pada menu ini`,
                response: null,
            })
        }
        db.end()
    } catch (err) {
        console.log(err)
    }
}