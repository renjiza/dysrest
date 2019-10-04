const pool = require('../config/database');
const auth = require('./auth');
const moment = require('moment');

const label = "popCodeTrans";

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
                    FROM pop
                    INNER JOIN department ON departmentId = popDepartmentId
                    WHERE popActive = 1
                    AND popClientId = '${input.client}'
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
                    FROM pop
                    WHERE popId = ${id}`
        const res = await db.query(sql)
        if (res.length > 0) {
            const sql2 = `SELECT 
                        popdet.*,
                        productCode,
                        productBarcode,
                        productName
                    FROM popdet
                    INNER JOIN product ON productId = popdetProductId
                    WHERE popdetPopId = ${res[0].popId}
                    ORDER BY popdetId ASC`
            const res2 = await db.query(sql2)
            res[0].detail = res2
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

exports.getDetail = async (req, reply) => {
    try {
        const db = await pool.getConnection()
        const id = req.params.id
        const input = req.query
        const column = input.column && input.column !== '' ? input.column : 'pop.*'
        const sql = `SELECT 
                    ${column},
                    departmentCode,
                    departmentName
                    FROM pop
                    INNER JOIN department ON departmentId = popDepartmentId
                    WHERE popId = ${id}`
        const res = await db.query(sql)
        if (res.length > 0) {
            const sql2 = `SELECT 
                        popdet.*,
                        productCode,
                        productBarcode,
                        productName
                    FROM popdet
                    INNER JOIN product ON productId = popdetProductId
                    WHERE popdetPopId = ${res[0].popId}
                    ORDER BY popdetId ASC`
            const res2 = await db.query(sql2)
            res[0].detail = res2
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
        const isAllow = await auth.isAllow(input.user, "pop", "add")
        if (isAllow) {            
            const sql = `call popCreate(?,?,?,?,?,?,?,?,?,?,?)`
            const res = await db.query(sql, [
                input.popDepartmentId, 
                moment(input.popDate).format('YYYY-MM-DD'),
                input.popRef,
                moment(input.popDateRequired).format('YYYY-MM-DD'),
                (input.popDescription || ''),
                JSON.stringify(input.detail),
                input.client,
                input.branch,
                input.user,
                input.fullname,
                input.logDetail,
            ])
            if (res[0][0].status === 1) {                                             
                req.io.sockets.emit('pop add', res[0][0])
                reply.send({
                    status: 200,
                    error: null,
                    response: `Pre Order Pembelian "${res[0][0].transcode}" berhasil dibuat`,
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
                error: `Pre Order Pembelian "${input[label]}" gagal dibuat, karena anda tidak lagi mempunyai akses "add" pada menu ini`,
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
        const isAllow = await auth.isAllow(input.user, "pop", "edit")        
        if (isAllow) {
            const sql = `call popUpdate(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
            const res = await db.query(sql, [
                input.popId,
                input.popCodeTrans,
                input.popDepartmentId,
                moment(input.popDate).format('YYYY-MM-DD'),
                input.popRef,
                moment(input.popDateRequired).format('YYYY-MM-DD'),
                (input.popDescription || ''),
                JSON.stringify(input.detail),
                input.popDetailDeleteId,
                input.client,
                input.branch,
                input.user,
                input.fullname,
                input.logDetail,
            ])
            if (res[0][0].status === 1) {                                
                req.io.sockets.emit('pop edit', res[0][0])
                reply.send({
                    status: 200,
                    error: null,
                    response: `Pre Order Pembelian "${input[label]}" berhasil diperbarui`,
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
                error: `Pre Order Pembelian "${input[label]}" gagal diubah, karena anda tidak lagi mempunyai akses "edit" pada menu ini`,
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
        const isAllow = await auth.isAllow(input.user, "pop", "delete")
        if (isAllow) {
            const sql = `call popDelete(?,?,?,?,?,?)`
            const res = await db.query(sql, [
                id,
                input.info,
                input.client,
                input.branch,
                input.user,
                input.fullname,
            ])
            if (res[0][0].status === 1) {
                req.io.sockets.emit('pop delete', res[0][0])
                reply.send({
                    status: 200,
                    error: null,
                    response: `Pre Order Pembelian "${input.info}" berhasil dihapus`,
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
                error: `Pre Order Pembelian "${input.info}" gagal dihapus, karena anda tidak lagi mempunyai akses "delete" pada menu ini`,
                response: null,
            })
        }
        db.end()
    } catch (err) {
        console.log(err)
    }
}