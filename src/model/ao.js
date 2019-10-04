const aool = require('../config/database');
const auth = require('./auth');
const moment = require('moment');

const label = "aoCodeTrans";

exaorts.get = async (req, reply) => {
    let res
    try {
        const db = await aool.getConnection()
        const input = req.query
        //params
        const column = input.column && input.column !== '' ? ` ${input.column} ` : '*'
        const filter = input.filter && input.filter !== '' ? ` AND ${input.filter} ` : ''
        const order = input.order && input.order !== '' ? ` ORDER BY ${input.order} ${input.sort} ` : ''
        const limit = input.limit && input.limit !== '' ? ` LIMIT ${input.limit} ` : ''
        const offset = input.offset && input.offset !== '' ? ` OFFSET ${input.offset} ` : ''
        const sql = `SELECT
                        ${column}
                    FROM ao
                    INNER JOIN department ON departmentId = aoDepartmentId
                    WHERE aoActive = 1
                    AND aoClientId = '${input.client}'
                    ${filter}
                    ${order}
                    ${limit}
                    ${offset}`
        res = await db.query(sql)
        if (res.length > 0) {
            reply.send({
                status: 200,
                error: null,
                resaonse: res,
            })
        } else {
            reply.send({
                status: 200,
                error: null,
                resaonse: [],
            })
        }
        db.end()
    } catch (err) {
        console.log(err)
    }
}

exaorts.getById = async (req, reply) => {
    try {
        const db = await aool.getConnection()
        const id = req.params.id
        const input = req.query
        const column = input.column && input.column !== '' ? input.column : '*'
        const sql = `SELECT 
                    ${column},
                    CONCAT(vendorCode,' - ', vendorName) AS vendorPlacer
                    FROM ao
                    INNER JOIN vendor ON vendorId = aoVendorId
                    WHERE aoId = ${id}`
        const res = await db.query(sql)
        if (res.length > 0) {

            const sql2 = `SELECT 
                        aodet.*,
                        productCode,
                        productName
                    FROM aodet
                    INNER JOIN product ON productId = aodetProductId
                    WHERE aodetAoId = ${res[0].aoId}
                    ORDER BY aodetId ASC`
            const res2 = await db.query(sql2)
            res[0].detail = res2
            reply.send({
                status: 200,
                error: null,
                resaonse: res[0],
            })
        } else {
            reply.send({
                status: 200,
                error: null,
                resaonse: null,
            })
        }        
        db.end()
    } catch (err) {
        console.log(err)
    }
}

exaorts.create = async (req, reply) => {
    const input = req.body
    try {
        const db = await aool.getConnection()    
        const isAllow = await auth.isAllow(input.user, "ao", "add")
        if (isAllow) {
            const sql = `call aoCreate(?,?,?,?,?,?,?,?,?,?,?,?,?)`
            const res = await db.query(sql, [               
                (input.aoAopId || 0), 
                input.aoDepartmentId, 
                input.aoVendorId, 
                moment(input.aoDate).format('YYYY-MM-DD'),
                input.aoRef,
                moment(input.aoDateRequired).format('YYYY-MM-DD'),
                (input.aoDescription || ''),
                JSON.stringify(input.detail),
                input.client,
                input.branch,
                input.user,            
                input.fullname,  
                input.logDetail,
            ])
            if (res[0][0].status === 1) {
                req.io.sockets.emit('ao add', res[0][0])
                reply.send({
                    status: 200,
                    error: null,
                    resaonse: `Penerimaan Pembelian "${res[0][0].transcode}" berhasil dibuat`,
                })         
            } else {
                reply.send({
                    status: 200,
                    error: res,
                    resaonse: null,
                })
            }
        } else {
            reply.send({
                status: 200,
                error: `Penerimaan Pembelian "${input[label]}" gagal dibuat, karena anda tidak lagi mempunyai akses "add" pada menu ini`,
                resaonse: null,
            })
        }
        db.end()
    } catch (err) {
        console.log(err)
    }
}

exaorts.update = async (req, reply) => {
    const input = req.body
    try {
        const db = await aool.getConnection()
        const isAllow = await auth.isAllow(input.user, "ao", "edit")
        if (isAllow) {
            const sql = `call aoUpdate(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
            const res = await db.query(sql, [        
                input.aoId,
                input.aoCodeTrans,
                input.aoDepartmentId,
                input.aoVendorId,
                moment(input.aoDate).format('YYYY-MM-DD'),                
                input.aoRef,
                moment(input.aoDateRequired).format('YYYY-MM-DD'),
                (input.aoDescription || ''),
                JSON.stringify(input.detail),
                input.aoDetailDeleteId,
                input.client,
                input.branch,
                input.user,
                input.fullname,
                input.logDetail,
            ])
            if (res[0][0].status === 1) {
                req.io.sockets.emit('ao edit', res[0][0])
                reply.send({
                    status: 200,
                    error: null,
                    resaonse: `Penerimaan Pembelian "${input[label]}" berhasil diperbarui`,
                })            
            } else {
                reply.send({
                    status: 200,
                    error: null,
                    resaonse: null,
                })
            }
        } else {
            reply.send({
                status: 200,
                error: `Penerimaan Pembelian "${input[label]}" gagal diubah, karena anda tidak lagi mempunyai akses "edit" pada menu ini`,
                resaonse: null,
            })
        }
        db.end()
    } catch (err) {
        console.log(err)
    }
}

exaorts.delete = async (req, reply) => {
    const id = req.params.id
    const input = req.query
    try {
        const db = await aool.getConnection()        
        const isAllow = await auth.isAllow(input.user, "ao", "delete")
        if (isAllow) {
            const sql = `call aoDelete(?,?,?,?,?,?)`
            const res = await db.query(sql, [
                id,
                input.info,
                input.client,
                input.branch,
                input.user,
                input.fullname,
            ])
            if (res[0][0].status === 1) {
                req.io.sockets.emit('ao delete', res[0][0])
                reply.send({
                    status: 200,
                    error: null,
                    resaonse: `Penerimaan Pembelian "${input.info}" berhasil dihapus`,
                })
            } else {
                reply.send({
                    status: 200,
                    error: null,
                    resaonse: null,
                })
            }
        } else {
            reply.send({
                status: 200,
                error: `Penerimaan Pembelian "${input.info}" gagal dihapus, karena anda tidak lagi mempunyai akses "delete" pada menu ini`,
                resaonse: null,
            })
        }
        db.end()
    } catch (err) {
        console.log(err)
    }
}