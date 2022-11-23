const express = require("express")
const { getAverageColor } = require("fast-average-color-node")
const nearestColor = require("nearest-color")
const colorNameList = require("color-name-list")

const app = express()

app.use(express.urlencoded({ extended: true }))
// app.use(express.static(path.join(__dirname, "public")))

app.set("view engine", "ejs")

app.get("/", (req, res) => {
  const context = req.dataProcessed
  res.render("index", { colorName: context?.name })
})

app.post(
  "/api/upload",
  (req, res, next) => {
    getAverageColor(req.body.base64Image, {
      mode: "precision",
      algorithm: "dominant",
    }).then((color) => {
      const names = colorNameList.reduce(
        (o, { name, hex }) => Object.assign(o, { [name]: hex }),
        {}
      )
      const nearest = nearestColor.from(names)
      req.dataProcessed = nearest(color.hex)
      console.log(`first ${req.dataProcessed}`)
      return next()
    })
  },
  (req, res) => {
    const context = req.dataProcessed
    res.render("index", { colorName: context.name })
  }
)

app.listen(process.env.PORT || 8000, () =>
  process.env.PORT
    ? console.log(`Listening at ${process.env.PORT}`)
    : console.log("Listening at http://localhost:8000")
)
