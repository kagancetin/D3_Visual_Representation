const createError = require('http-errors')
const express = require('express')
const path = require('path')
const exphbs = require("express-handlebars")
const helper = require('./handlebarsHelpers')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const indexRouter = require('./routes/index')

const app = express()

// Template Engine
const hbs = exphbs.create({
  extname: "hbs",
  helpers: helper
})

app.engine("hbs", hbs.engine)
app.set("view engine", "hbs")
app.set("views", path.join(__dirname, "views"))

app.use(logger('dev'))

app.use(express.json()).use(
  express.urlencoded({
    limit: '1024mb',
    extended: true
  })
)

app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use('/', indexRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('pages/error')
})

app.listen(5005, () =>
  console.log(`Express server listening on port 5005`)
)