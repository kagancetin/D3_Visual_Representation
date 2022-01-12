const express = require('express')
const router = express.Router()
const formidable = require('formidable')
const path = require("path")
const fs = require("fs").promises

/* GET home page. */
router.get('/', function (req, res) {
  res.render('pages/index', {title: 'PDF to JSON Converter'})
})

router.get('/export/:fileName', async (req, res) => {
  try {
    const file = await fs.readFile(path.join(__dirname, `../public/exports/${req.params.fileName}`), 'utf8')
    res.render('pages/exports', {fileName: file})
  } catch (err) {
    console.log(err)
    res.render('pages/exports', {fileName: "error"})
  }
})

router.post('/file', async (req, res) => {
  let json
  const {fileName} = req.body
  try {
    const file = await fs.readFile(path.join(__dirname, `../public/exports/${fileName}`), 'utf8')
    json = JSON.parse(file)
    res.send(json)
  } catch (err) {
    console.log(err)
    res.send(false)
  }

})

router.post('/upload', function (req, res, next) {
  const form = new formidable.IncomingForm({maxFileSize: 1000 * 1024 * 1024}) // 1GB
  form.parse(req, async (err, fields, files) => {
    try {
      console.log(files)
      await fs.rename(files.file.filepath, path.join(__dirname, `../public/exports/${files.file.newFilename}`))
      res.send({name: files.file.newFilename})
    } catch (err) {
      console.log(err)
      res.status(404).send({error: err})
    }
  })

})

module.exports = router