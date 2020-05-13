// Operating environment
const httpPort = 8699

const memberRoute = require('./routes/member')
// ======================================================================
// Kernel
const Koa = require('koa')
const Router = require('koa-router')
// Middleware
const bodyParser = require('koa-bodyparser')
const router = new Router()
const app = new Koa()
// ======================================================================
// Error handler
const errorHandler = () => async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.response.status = err.statusCode || err.status || 500
    ctx.response.body = {
      message: err.message
    }
  }
}

// Middleware
app.use(bodyParser())
app.use(errorHandler())
// ======================================================================
// Router
router.use(`/member`, memberRoute.routes(), memberRoute.allowedMethods())

app.use(router.routes())
app.use(router.allowedMethods())
// ======================================================================
app.listen(httpPort, () => console.log(`Listening on port ${httpPort} (http)`))

module.exports = app
