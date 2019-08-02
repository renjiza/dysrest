const pool = require('../config/connector');
const bcrypt = require('bcryptjs');

exports.get = async (req, reply) => {
    let res
    try {
        const db = await pool.getConnection()
        const input = req.query
        //params
        const column = input.column && input.column !== '' ? ` AND ${input.column} ` : '*'
        const filter = input.filter && input.filter !== '' ? ` AND ${input.filter} ` : ''
        const order = input.order && input.order !== '' ? ` ORDER BY ${input.order} ${input.sort} ` : ''
        const limit = input.limit && input.limit !== '' ? ` LIMIT ${input.limit} ` : ''
        const offset = input.offset && input.offset !== '' ? ` OFFSET ${input.offset} ` : ''
        const sql = `SELECT
                        ${column}
                    FROM user
                    WHERE 
                    userActive = 1
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
                response: null,
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
        const params = input.q ? JSON.parse(input.q) : {} ;
        const column = params.column && params.column !== '' ? params.column : '*'
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
    try {
        const db = await pool.getConnection()
        const input = req.body
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
                response: `User ${input.userFullname} berhasil ditambahkan`,
            })            
        } else {
            reply.send({
                status: 200,
                error: res,
                response: null,
            })
        }
        db.end()
    } catch (err) {
        console.log(err)
    }
}

exports.update = async (req, reply) => {
    try {
        const db = await pool.getConnection()
        const input = req.body
        const sql = `call userUpdate(?,?,?,?,?,?)`
        const res = await db.query(sql, [
            input.id,
            input.userEmail,
            input.userPassword,
            input.userFullname,
            input.user,
            input.logDetail,
        ])
        if (res[0][0].status === 1) {
            reply.send({
                status: 200,
                error: null,
                response: `User ${input.userFullname} berhasil diperbarui`,
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

exports.delete = async (req, reply) => {
    try {
        const db = await pool.getConnection()
        const id = req.params.id
        const input = req.query
        const sql = `call userDelete(?,?)`
        const res = await db.query(sql, [
            id,
            input.user,
        ])
        if (res[0][0].status === 1) {
            reply.send({
                status: 200,
                error: null,
                response: `User ${input.info} berhasil dihapus`,
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