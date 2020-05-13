const crypto = require('crypto')
const db = require('../lib/mysql')
// router
const Router = require('koa-router')
const router = new Router()

// AES-128
// 密鑰(必須為16碼)
const key = 'key1111111111111'
// 使用向量
const iv = ''

// ======================================================================
// ctx response
const resJsonCtx = async (ctx, data) => {
  ctx.response.type = 'json'
  ctx.response.body = data
}

// ======================================================================
// 加密,解密
// AES-128-ECB 加密
const encrypt = async (key, iv, data) => {
  let cipher = crypto.createCipheriv('aes-128-ecb', key, iv)
  let crypted = cipher.update(data, 'utf8', 'binary')
  crypted += cipher.final('binary')
  crypted = Buffer.from(crypted, 'binary').toString('base64')
  return crypted
}

// AES-128-ECB 解密
const decrypt = (key, iv, crypted) => new Promise((resolve, reject) => {
  crypted = Buffer.from(crypted, 'base64').toString('binary')
  let decipher = crypto.createDecipheriv('aes-128-ecb', key, iv)
  let decoded = decipher.update(crypted, 'binary', 'utf8')
  decoded += decipher.final('utf8')
  resolve([null, decoded])
}).catch(error => [error, null])

// ======================================================
router.post('/login', async ctx => {
  let result = {}
  let userNo = decodeURIComponent(ctx.request.body.userNo)
  let password = decodeURIComponent(ctx.request.body.password)

  let [error, decPassword] = await decrypt(key, iv, password)
  if (error) {
    result.status = '-99'
    result.userName = '系統錯誤'
  } else {
    let dbResult = await db.queryMember(userNo, decPassword)
    if (dbResult.length === 1) {
      result.status = '1'
      result.userName = dbResult[0].userName
    } else {
      result.status = '-1'
      result.userName = '帳號或密碼錯誤'
    }
  }

  await resJsonCtx(ctx, result)
})

module.exports = router
