const exampleJSON = JSON.parse(document.querySelector("#jsonfile").value)
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

exampleArray.forEach(element => {
  times.push(element["time-stamp"])
  if (actorIds[element["actor-id"]]) actorIds[element["actor-id"]]++
  else actorIds[element["actor-id"]] = 1
  if (element["parent"]) {
    family.push({
      id: element["tareas"]["nombre"],
      parentId: exampleArray[element["parent"]]["tareas"]["nombre"],
      actor_id: element["actor-id"],
      actor: element["actores"],
      tareas: element["tareas"]
    })
  } else {
    family.push({id: element["tareas"]["nombre"], actor_id: element["actor-id"], actor: element["actores"], tareas: element["tareas"]})
  }
})

const root = d3.stratify()(family)
const dx = 30
const dy = 120
const tree = d3.tree().nodeSize([dx, dy])
const treeLink = d3.linkHorizontal().x(d => d.y).y(d => d.x)

function graph(root, {
  label = d => d.data.id,
  labelHtml = d => `${d.data.id} <tspan font-size="6px" data-id="${d.data.id}" >(${d.data.actor.nombre})</tspan>`,
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
    .attr("fill", "#999")
    .attr("data-id", label)
    .attr("data-id-circle", "")
    .style("cursor", "pointer")
    .attr("r", d => actorIds[d.data.actor_id] + 2)

  node.append("text")
    .attr("text-anchor", "middle")
    .attr("y", "-10px")
    .attr("x", "0px")
    .attr("data-id", label)
    .html(labelHtml)
    .style("cursor", "pointer")
    .clone(true).lower()
    .attr("stroke", "white")

  return svg.node()
}

function click(d) {
  let html = ""
  document.querySelectorAll("[data-id-circle]").forEach(p => {
    if (p.dataset.id == d.target.dataset.id) p.setAttribute("fill", "#555")
    else p.setAttribute("fill", "#999")
  })
  exampleJSON["actividades"].forEach(element => {
    if (element["tareas"]["nombre"] === d.target.dataset.id) {
      html += `
          <h5>${element["tareas"]["nombre"]}</h5>
          <ul>
            <li>Actores clave : <strong>${element["actores"]["clave"]}</strong></li>
            <li>Actores nombre : <strong>${element["actores"]["nombre"]}</strong></li>
            <li>tareas clave : <strong>${element["tareas"]["clave"]}</strong></li>
            <li>tareas nombre : <strong>${element["tareas"]["nombre"]}</strong></li>
            <li>tareas efectividad : <strong>${element["tareas"]["efectividad"]}</strong></li>
            <li>tareas repercusion : <strong>${element["tareas"]["repercusion"]}</strong></li>
            <li>time-stamp : <strong>${new Date(element["time-stamp"])}</strong></li>
          </ul>
            `
    }
  })

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

  let m = area.clientWidth > 599 ? 90 : 10
  const dst = d3
    .scaleTime()
    .domain([new Date(times[0]), new Date(times[times.length - 1])])
    .range([m, area.clientWidth - m])
    .nice()

  const svg = visualizeTicks(dst, [10, d3.timeFormat("%I %p %b %d")], area.clientWidth)
  d3.select(svg).style("overflow", "visible").attr("class", "mt-5")
  let i = []

  usedTime = {}
  exampleArray.forEach(element => {
    if (i[element["time-stamp"]]) i[element["time-stamp"]]++
    else i[element["time-stamp"]] = 1
    d3.select(svg)
      .append("line")
      .attr("opacity", "0.8")
      .attr("x1", dst(new Date(element["time-stamp"])) + "px")
      .attr("x2", dst(new Date(element["time-stamp"])) + "px")
      .attr("y1", 40 * (i[element["time-stamp"]] - 1) + (i[element["time-stamp"]] - 1 == 0 ? 0 : 4))
      .attr("y2", 40 * i[element["time-stamp"]] - 12)
      .attr("stroke", "black")
    d3.select(svg)
      .append("text")
      .attr("fill", "black")
      .attr("font-size", "12px")
      .attr("text-anchor", "middle")
      .attr("x", dst(new Date(element["time-stamp"])) + "px")
      .attr("y", 40 * i[element["time-stamp"]] + "px")
      .text(element["tareas"]["nombre"])
      .attr("data-id", element["tareas"]["nombre"])
      .style("cursor", "pointer")
      .on("click", click)
      .clone(true).lower()
    if (!usedTime[element["time-stamp"]]) {
      usedTime[element["time-stamp"]] = true
      d3.select(svg)
        .append("text")
        .attr("fill", "black")
        .attr("font-size", "0.7em")
        .text(moment(element["time-stamp"]).format("LT"))
        .attr("transform", `translate(${dst(new Date(element["time-stamp"])) + 3}, -5) rotate(-90)`)
        .clone(true).lower()
    }
  })

  area.appendChild(graph(root))
  timeline.appendChild(svg)

  pathHover()
}