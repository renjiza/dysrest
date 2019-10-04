const pool = require('../config/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.checkSession = async (req, reply) => {
    try {      
        const db = await pool.getConnection()
        const input = req.query
        const sql = `SELECT
                        userId,
                        userEmail,
                        userPassword,
                        userFullname,
                        userSuper,
                        userToken AS token,
                        clientId,
                        clientName,
                        clientEmail,
                        clientPhone,
                        clientAddress,
                        clientLogo,
                        branchId,
                        branchName
                    FROM user
                    INNER JOIN client ON clientId = userClientId
                    INNER JOIN branch ON branchId = userBranchId
                    WHERE userToken = '${input.token}'
                    AND userActive = 1`
        const res = await db.query(sql)
        if (res.length > 0) {
            reply.send({
                status: 200,
                error: null,
                response: { ...{ isLogged: true }, ...res[0] }
            })
        } else {
            reply.send({
                status: 200,
                error: "Sesi login berakhir, harap login ulang.",
                response: null,
            })
        }
        db.end()
    } catch (err) {
        console.log(err)
    }
}

exports.in = async (req, reply) => {
    try {        
        const db = await pool.getConnection()
        const input = req.body
        const hashPassword = bcrypt.hashSync(input.password, 10)
        const sql = `SELECT
                        userId,
                        userEmail,
                        userPassword,
                        userFullname,
                        userSuper,
                        clientId,
                        clientName,
                        clientEmail,
                        clientPhone,
                        clientAddress,
                        clientLogo,
                        branchId,
                        branchName
                    FROM user
                    INNER JOIN client ON clientId = userClientId
                    INNER JOIN branch ON branchId = userBranchId
                    WHERE userEmail = '${input.email}'
                    AND userActive = 1`
        const res = await db.query(sql)

        var chunkUpdateToken = async () => {
            token = jwt.sign({ id: res[0].userId }, 'muhammadevanozaflanalfarezel', {
                expiresIn: 86400, // expires in 24 hours
                subject: Date.now().toString()
            })
            await db.query(`UPDATE user SET userToken = '${token}' WHERE userId = ${res[0].userId}`)
            reply.send({
                status: 200,
                error: null,
                response: { ...{ isLogged: true, token: token }, ...res[0] }
            })
        }

        if (res.length > 0) {
            if (bcrypt.compareSync(input.password, res[0].userPassword)) {                
                if (res[0].userToken === null) {
                    chunkUpdateToken()
                } else {
                    if (req.connected[res[0].userId]) {                        
                        if (req.connected[res[0].userId]['connected']) {
                            req.connected[res[0].userId].emit('notify user already login', {
                                content: 'User yang kamu pakai sekarang, sedang mencoba login dari perangkat lain.'
                            })                        
                        }
                        reply.send({
                            status: 200,
                            error: `User kamu sedang login di perangkat lain.`,
                            response: null,
                        })
                    } else {
                        chunkUpdateToken()
                    }                    
                }
            } else {
                reply.send({
                    status: 200,
                    error: `Password kamu salah.`,
                    response: null,
                })
            }
        } else {
            reply.send({
                status: 200,
                error: `Email kamu belum terdaftar.`,
                response: null,
            })
        }
        db.end()
    } catch (err) {
        console.log(err)
    }
}

exports.out = async (req, reply) => {
    try {
        let db = await pool.getConnection()
        const input = req.body
        await db.query(`UPDATE user SET userToken = null WHERE userId = '${input.user}'`).catch(e => console.log(e))
        delete req.connected[input.user]
        reply.send({
            status: 200,
            error: null,
            response: null,
        })
        db.end()
    } catch (err) {
        console.log(err)
    }
}

exports.getMenu = async (req, reply) => {
    try {
        let db = await pool.getConnection()
        const input = req.query
        const sql = `   SELECT menu.*
                        FROM cm
                        INNER JOIN menu ON (JSON_CONTAINS(cm.cmArrayMenuId, CAST(menuId AS CHAR)) OR menuParentId = 0)
                        WHERE
                        cmClientId = '${input.client}'
                        GROUP BY menuId
                        ORDER BY menuSort, menuAction ASC`
        const res = await db.query(sql)
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

exports.getMenuByToken = async (req, reply) => {
    try {
        let db = await pool.getConnection()
        const token = req.query.token
        const sql = `   SELECT menuId, menuKey, menuLabel, menuIcon, menuAction, menuLink, menuParentId, menuSort, userClientId
                        FROM privilege
                        INNER JOIN user ON userId = privilegeUserId
                        INNER JOIN menu ON (JSON_CONTAINS(privilege.privilegeArrayMenuId, CAST(menuId AS CHAR)) OR menuParentId = 0)
                        WHERE
                        userToken = '${token}'
                        ORDER BY menuSort ASC`
        const res = await db.query(sql)
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

exports.getNotificationPrivilegeById = async (req, reply) => {
    try {
        let db = await pool.getConnection()
        const id = req.query.user
        const sql = `   SELECT menuId, menuKey, menuAction, menuSort
                        FROM menu
                        INNER JOIN user ON JSON_CONTAINS(userNotificationPrivilege, CAST(menuId AS CHAR))
                        WHERE
                        userId = '${id}'
                        ORDER BY 
                        menuSort ASC`
        const res = await db.query(sql)
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

exports.getNotification = async (req, reply) => {
    try {
        let db = await pool.getConnection()
        const userId = req.query.user
        const sql = `   SELECT *
                        FROM recipient
                        INNER JOIN notification ON notificationId = recipientNotificationId
                        WHERE recipientUserId = '${userId}'
                        ORDER BY recipientIsRead ASC, notificationDatetime DESC`
        const res = await db.query(sql)
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

exports.isAllow = async (userId, menu, action) => {
    try {
        let db = await pool.getConnection()
        const sql = `
                    SELECT 
                        COUNT(menuId) AS allow
                    FROM privilege
                    INNER JOIN menu 
                        ON JSON_CONTAINS(privilegeArrayMenuId, CAST(menuId AS CHAR)) AND menuLink = ? AND menuAction = ?
                    WHERE privilegeUserId = ?
                    `
        const res = await db.query(sql, ['/' + menu, action, userId])                
        db.end()
        return (res.length > 0) ? res[0].allow === 1 : false        
    } catch (err) {
        console.log(err)
    }
}