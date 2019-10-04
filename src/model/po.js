const pool = require('../config/database');
const auth = require('./auth');
const moment = require('moment');

const label = "poCodeTrans";

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
                    FROM po
                    INNER JOIN department ON departmentId = poDepartmentId
                    WHERE poActive = 1
                    AND poClientId = '${input.client}'
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
                    ${column},
                    CONCAT(vendorCode,' - ', vendorName) AS vendorPlacer
                    FROM po
                    INNER JOIN vendor ON vendorId = poVendorId
                    WHERE poId = ${id}`
        const res = await db.query(sql)
        if (res.length > 0) {

            const sql2 = `SELECT 
                        podet.*,
                        productCode,
                        productName
                    FROM podet
                    INNER JOIN product ON productId = podetProductId
                    WHERE podetPoId = ${res[0].poId}
                    ORDER BY podetId ASC`
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
        const column = input.column && input.column !== '' ? input.column : 'po.*'
        const sql = `SELECT 
                    ${column},
                    departmentCode,
                    departmentName,
                    vendorCode,
                    vendorName
                    FROM po
                    INNER JOIN department ON departmentId = poDepartmentId
                    INNER JOIN vendor ON vendorId = poVendorId
                    WHERE poId = ${id}`
        const res = await db.query(sql)
        if (res.length > 0) {
            const sql2 = `SELECT 
                        podet.*,
                        productCode,
                        productBarcode,
                        productName
                    FROM podet
                    INNER JOIN product ON productId = podetProductId
                    WHERE podetPoId = ${res[0].poId}
                    ORDER BY podetId ASC`
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
        const isAllow = await auth.isAllow(input.user, "po", "add")
        if (isAllow) {
            const sql = `call poCreate(?,?,?,?,?,?,?,?,?,?,?,?,?)`
            const res = await db.query(sql, [               
                (input.poPopId || 0), 
                input.poDepartmentId, 
                input.poVendorId, 
                moment(input.poDate).format('YYYY-MM-DD'),
                input.poRef,
                moment(input.poDateRequired).format('YYYY-MM-DD'),
                (input.poDescription || ''),
                JSON.stringify(input.detail),
                input.client,
                input.branch,
                input.user,            
                input.fullname,  
                input.logDetail,
            ])
            if (res[0][0].status === 1) {
                req.io.sockets.emit('po add', res[0][0])
                reply.send({
                    status: 200,
                    error: null,
                    response: `Order Pembelian "${res[0][0].transcode}" berhasil dibuat`,
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
                error: `Order Pembelian "${input[label]}" gagal dibuat, karena anda tidak lagi mempunyai akses "add" pada menu ini`,
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
        const isAllow = await auth.isAllow(input.user, "po", "edit")
        if (isAllow) {
            const sql = `call poUpdate(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
            const res = await db.query(sql, [        
                input.poId,
                input.poCodeTrans,
                input.poDepartmentId,
                input.poVendorId,
                moment(input.poDate).format('YYYY-MM-DD'),                
                input.poRef,
                moment(input.poDateRequired).format('YYYY-MM-DD'),
                (input.poDescription || ''),
                JSON.stringify(input.detail),
                input.poDetailDeleteId,
                input.client,
                input.branch,
                input.user,
                input.fullname,
                input.logDetail,
            ])
            if (res[0][0].status === 1) {
                req.io.sockets.emit('po edit', res[0][0])
                reply.send({
                    status: 200,
                    error: null,
                    response: `Order Pembelian "${input[label]}" berhasil diperbarui`,
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
                error: `Order Pembelian "${input[label]}" gagal diubah, karena anda tidak lagi mempunyai akses "edit" pada menu ini`,
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
        const isAllow = await auth.isAllow(input.user, "po", "delete")
        if (isAllow) {
            const sql = `call poDelete(?,?,?,?,?,?)`
            const res = await db.query(sql, [
                id,
                input.info,
                input.client,
                input.branch,
                input.user,
                input.fullname,
            ])
            if (res[0][0].status === 1) {
                req.io.sockets.emit('po delete', res[0][0])
                reply.send({
                    status: 200,
                    error: null,
                    response: `Order Pembelian "${input.info}" berhasil dihapus`,
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
                error: `Order Pembelian "${input.info}" gagal dihapus, karena anda tidak lagi mempunyai akses "delete" pada menu ini`,
                response: null,
            })
        }
        db.end()
    } catch (err) {
        console.log(err)
    }
}