const exampleJSON = JSON.parse(document.querySelector("#jsonfile").value)
console.log(exampleJSON)
let flare = {}
let exampleArray = []
let family = []
let actorIds = []
let times = []

exampleJSON["actividades"].forEach(element => {

  if (element["hijos"]) {
    element["hijos"].forEach(p => {
      exampleJSON["actividades"] = exampleJSON["actividades"].map(o => {
        o["tarea-id"] === p ? o["parent"] = element["tarea-id"] : o
        return o
      })
    })
  }
  element["tareas"] = exampleJSON["tareas"].find(o => o["clave"] === element["tarea-id"])
  element["actores"] = exampleJSON["actores"].find(o => o["clave"] === element["actor-id"])

  exampleArray[element["tarea-id"]] = element
})

console.log(exampleArray)
exampleArray.forEach(element => {
  times.push(element["time-stamp"])
  if (actorIds[element["actor-id"]]) actorIds[element["actor-id"]]++
  else actorIds[element["actor-id"]] = 1
  if (element["parent"]) {
    family.push({
      id: element["tareas"]["nombre"],
      parentId: exampleArray[element["parent"]]["tareas"]["nombre"],
      actor_id: element["actor-id"],
      tareas: element["tareas"]
    })
  } else {
    family.push({id: element["tareas"]["nombre"], actor_id: element["actor-id"], tareas: element["tareas"]})
  }
})

const root = d3.stratify()(family)
const dx = 30
const dy = 120
const tree = d3.tree().nodeSize([dx, dy])
const treeLink = d3.linkHorizontal().x(d => d.y).y(d => d.x)

function graph(root, {
  label = d => d.data.id,
  highlight = () => false,
  marginLeft = 40,
  width = 500
} = {}) {

  root = tree(root)
  let x0 = Infinity
  let x1 = -x0
  root.each(d => {
    if (d.x > x1) x1 = d.x
    if (d.x < x0) x0 = d.x
  })

  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, x1 - x0 + dx * 2])
    .style("overflow", "visible")

  const g = svg.append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 7)
    .attr("transform", `translate(${marginLeft},${dx - x0})`)

  const link = g.append("g")
    .attr("fill", "none")
    .attr("stroke-opacity", 1)
    .selectAll("path")
    .data(root.links())
    .join("path")
    .attr("stroke", d => chooseColor(d.target.data.tareas.repercusion))
    .attr("stroke-width", d => (d.target.data.tareas.efectividad / 3) + 2)
    .attr("class", "path")
    .attr("data-efectividad", d => d.source.data.tareas.nombre + " efectividad: " + d.source.data.tareas.efectividad + " - " + d.target.data.tareas.nombre + " efectividad: " + d.target.data.tareas.efectividad)
    .attr("d", treeLink)

  const node = g.append("g")
    .attr("stroke-linejoin", "round")
    .attr("stroke-width", 3)
    .selectAll("g")
    .data(root.descendants())
    .join("g")
    .attr("transform", d => `translate(${d.y},${d.x})`)
    .attr("data-id", label)
    .on("click", click)

  node.append("circle")
    .attr("fill", d => highlight(d) ? "red" : d.children ? "#555" : "#999")
    .attr("data-id", label)
    .style("cursor", "pointer")
    .attr("r", d => actorIds[d.data.actor_id] + 2)

  node.append("text")
    .attr("text-anchor", "middle")
    .attr("y", "-10px")
    .attr("x", "0px")
    .attr("data-id", label)
    .text(label)
    .style("cursor", "pointer")
    .clone(true).lower()
    .attr("stroke", "white")

  return svg.node()
}

function click(d) {
  let html = "<ul>"

  exampleJSON["actividades"].forEach(element => {
    if (element["tareas"]["nombre"] === d.target.dataset.id) {
      html += `
            <li>Actores clave : ${element["actores"]["clave"]}</li>
            <li>Actores nombre : ${element["actores"]["nombre"]}</li>
            <li>tareas clave : ${element["tareas"]["clave"]}</li>
            <li>tareas nombre : ${element["tareas"]["nombre"]}</li>
            <li>tareas efectividad : ${element["tareas"]["efectividad"]}</li>
            <li>tareas repercusion : ${element["tareas"]["repercusion"]}</li>
            <li>time-stamp : ${new Date(element["time-stamp"])}</li>
            `
    }
  })
  html += "</ul>"

  let infoArea = document.querySelector("#info")
  infoArea.innerHTML = html
}

function chooseColor(data) {
  if (data == "neutro") return "#adb5bd"
  else if (data == "negativo") return "#dc3545"
  else if (data == "positivo") return "#198754"
  else "#0d6efd"
}

function pathHover() {
  const allPaths = document.querySelectorAll(".path")
  allPaths.forEach(p => {
    var myDiv
    p.onmouseover = (evt) => {
      console.log(evt)
      myDiv = document.createElement('div')
      myDiv.classList.add("bg-white")
      myDiv.classList.add("p-2")
      myDiv.classList.add("d-inline")
      myDiv.style.cssText = `
            position:absolute;
            left: ${evt.clientX - myDiv.offsetWidth / 2}px; top: ${evt.clientY - 100}px;
          `
      myDiv.innerText = `${p.dataset.efectividad}`
      document.body.appendChild(myDiv)
    }
    p.onmousemove = (evt) => {
      myDiv.style.cssText = `
            position:absolute;
            left: ${evt.pageX - myDiv.offsetWidth / 2}px; top: ${evt.pageY - 100}px;
          `
    }
    p.onmouseleave = (evt) => {
      myDiv.remove()
    }
  })
}

function visualizeTicks(scale, tickArguments, width) {
  const height = "100%", m = width > 599 ? 90 : 10

  if (tickArguments === undefined) tickArguments = []

  scale.range([m, width - m])

  let svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)

  svg.append("g").call(d3.axisBottom(scale).ticks(...tickArguments))
  return svg.node()
}

window.onload = () => {
  let area = document.querySelector("#area")
  let timeline = document.querySelector("#timeline")

  times = times.sort()
  times = times.filter((e, i, a) => e !== a[i - 1])
  console.log(new Date(times[0]))
  console.log(new Date(times[times.length - 1]))

  let m = area.clientWidth > 599 ? 90 : 10
  const dst = d3
    .scaleTime()
    .domain([new Date(times[0]), new Date(times[times.length - 1])])
    .range([m, area.clientWidth - m])
    .nice()

  console.log(window)
  const svg = visualizeTicks(dst, [10, d3.timeFormat("%I %p %b %d")], area.clientWidth)

  let i = []
  exampleArray.forEach(element => {
    if (i[element["time-stamp"]]) i[element["time-stamp"]]++
    else i[element["time-stamp"]] = 1
    d3.select(svg)
      .append("line")
      .attr("x1", dst(new Date(element["time-stamp"])) + "px")
      .attr("x2", dst(new Date(element["time-stamp"])) + "px")
      .attr("y1", 0)
      .attr("y2", 40 * i[element["time-stamp"]])
      .attr("stroke", "black")
    d3.select(svg)
      .append("text")
      .attr("fill", "black")
      .attr("font-size", "0.8em")
      .attr("x", dst(new Date(element["time-stamp"])) + "px")
      .attr("y", 40 * i[element["time-stamp"]] + 10 + "px")
      .text(moment(element["time-stamp"]).format("hh:mm"))
      .clone(true).lower()
    d3.select(svg)
      .append("text")
      .attr("fill", "black")
      .attr("font-size", "0.9em")
      .attr("x", dst(new Date(element["time-stamp"])) + "px")
      .attr("y", 40 * i[element["time-stamp"]] + 25 + "px")
      .text(element["tareas"]["nombre"])
      .clone(true).lower()
  })

  area.appendChild(graph(root))
  timeline.appendChild(svg)

  pathHover()
}