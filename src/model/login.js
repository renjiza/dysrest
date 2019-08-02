const pool = require('../config/connector');
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
                        clientId,
                        clientName,
                        branchId,
                        branchName
                    FROM user
                    INNER JOIN client ON clientId = userClientId
                    INNER JOIN branch ON branchId = userBranchId
                    WHERE userToken = '${input.token}'`
        const res = await db.query(sql)
        if (res.length > 0) {
            reply.send({
                status: 200,
                error: null,
                response: {
                    isLogged: true,
                    token: res[0].userToken,
                    userId: res[0].userId,
                    email: res[0].userEmail,
                    fullname: res[0].userFullname,
                    clientId: res[0].clientId,
                    clientname: res[0].clientName,
                    branchId: res[0].branchId,
                    branchname: res[0].branchName,
                }
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
                        clientId,
                        clientName,
                        branchId,
                        branchName
                    FROM user
                    INNER JOIN client ON clientId = userClientId
                    INNER JOIN branch ON branchId = userBranchId
                    WHERE userEmail = '${input.email}'`
        const res = await db.query(sql)
        if (res.length > 0) {
            if (bcrypt.compareSync(input.password, res[0].userPassword)) {
                token = jwt.sign({ id: res[0].userId }, 'muhammadevanozaflanalfarezel', {
                    expiresIn: 86400, // expires in 24 hours
                    subject: Date.now().toString()
                });            
                await db.query(`UPDATE user SET userToken = '${token}' WHERE userId = ${res[0].userId}`)
                reply.send({
                    status: 200,
                    error: null,
                    response: {
                        isLogged: true,
                        token: token,
                        userId: res[0].userId,
                        email: res[0].userEmail,
                        fullname: res[0].userFullname,
                        clientId: res[0].clientId,
                        clientname: res[0].clientName,
                        branchId: res[0].branchId,
                        branchname: res[0].branchName,
                    }
                })
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
                        INNER JOIN menu ON menuId = cmMenuId
                        WHERE
                        cmClientId = '${input.client}'
                        GROUP BY menuId
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

exports.getMenuByToken = async (req, reply) => {
    try {
        let db = await pool.getConnection()
        const token = req.query.token
        const sql = `   SELECT menuId, menuLabel, menuIcon, menuAction, menuLink, menuParentId, menuSort, userClientId
                        FROM privilege
                        INNER JOIN user ON userId = privilegeUserId
                        INNER JOIN menu ON JSON_CONTAINS(privilege.privilegeArrayMenuId, CAST(menuId AS CHAR))
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

exports.getPrivilege = async (req, reply) => {
    try {
        let db = await pool.getConnection()
        const input = req.query
        const sql = `   SELECT menuId, menuLabel, menuIcon, menuAction, menuLink, menuParentId, menuSort, userClientId AS menuClientId
                        FROM privilege
                        INNER JOIN user ON userId = privilegeUserId
                        INNER JOIN menu ON JSON_CONTAINS(privilege.privilegeArrayMenuId, CAST(menuId AS CHAR))
                        WHERE privilegeUserId = ?
                        AND menuLink = ?
                        ORDER BY menuSort ASC`
        const res = await db.query(sql, [input.user, input.link])
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