
const exampleJSON = {
    "actores": [
        {
            "clave": 2661,
            "nombre": "Actor1"
        },
        {
            "clave": 2701,
            "nombre": "Actor2"
        },
        {
            "clave": 2705,
            "nombre": "Actor3"
        }
    ],
    "tareas": [
        {
            "clave": 1,
            "nombre": "Tarea1",
            "efectividad": 1,
            "repercusion": "positivo"
        },
        {
            "clave": 2,
            "nombre": "Tarea2",
            "efectividad": 3,
            "repercusion": "neutro"
        },
        {
            "clave": 3,
            "nombre": "Tarea4",
            "efectividad": 4,
            "repercusion": "positivo"
        },
        {
            "clave": 4,
            "nombre": "Tarea3",
            "efectividad": 5,
            "repercusion": "negativo"
        }
        ,
        {
            "clave": 5,
            "nombre": "Tarea5",
            "efectividad": 2,
            "repercusion": "positivo"
        }
        ,
        {
            "clave": 6,
            "nombre": "Tarea6",
            "efectividad": 7,
            "repercusion": "negativo"
        }
    ],
    "actividades": [
        {
            "tarea-id": 1,
            "actor-id": 2661,
            "time-stamp": 1642298400000,
            "hijos": [
                3
            ]
        },
        {
            "tarea-id": 3,
            "actor-id": 2661,
            "time-stamp": 1642384800000,
            "hijos": [
                5, 6
            ]
        },
        {
            "tarea-id": 2,
            "actor-id": 2661,
            "time-stamp": 1642298400000,
            "hijos": [
                1, 4
            ]
        },
        {
            "tarea-id": 4,
            "actor-id": 2705,
            "time-stamp": 1642298400000
        },
        {
            "tarea-id": 5,
            "actor-id": 2701,
            "time-stamp": 1642384800000
        },
        {
            "tarea-id": 6,
            "actor-id": 2705,
            "time-stamp": 1642471200000
        }
    ]
}

console.log(exampleJSON)

let flare = {

}
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
        family.push({id: element["tareas"]["nombre"], parentId: exampleArray[element["parent"]]["tareas"]["nombre"], actor_id: element["actor-id"], tareas: element["tareas"]})
    }
    else {
        family.push({id: element["tareas"]["nombre"], actor_id: element["actor-id"], tareas: element["tareas"]})
    }
})




console.log(actorIds)

//const tree = d3.treemap();


const root = d3.stratify()(family)
const dx = 30
const dy = 120
const tree = d3.tree().nodeSize([dx, dy])
const treeLink = d3.linkHorizontal().x(d => d.y).y(d => d.x)

let width = 500


function graph(root, {
    label = d => d.data.id,
    highlight = () => false,
    marginLeft = 40
} = {}) {

    root = tree(root);
    console.log(root.links())
    let x0 = Infinity;
    let x1 = -x0;
    root.each(d => {
        if (d.x > x1) x1 = d.x;
        if (d.x < x0) x0 = d.x;
    });

    const svg = d3.create("svg")
        .attr("viewBox", [0, 0, width, x1 - x0 + dx * 2])
        .style("overflow", "visible");

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
        .attr("stroke-width", d => (d.target.data.tareas.efectividad / 4) + 1)
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
        .on("click", click);


    node.append("circle")
        .attr("fill", d => highlight(d) ? "red" : d.children ? "#555" : "#999")
        .attr("data-id", label)
        .style("cursor", "pointer")
        .attr("r", d => actorIds[d.data.actor_id] + 2);

    node.append("text")
        .attr("text-anchor", "middle")
        .attr("y", "-10px")
        .attr("x", "0px")
        .attr("data-id", label)
        .text(label)
        .style("cursor", "pointer")
        .clone(true).lower()
        .attr("stroke", "white")

    return svg.node();
}


function click(d) {
    console.log(d.target.dataset.id)
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
    if (data == "neutro") return "#adb5bd";
    else if (data == "negativo") return "#dc3545";
    else if (data == "positivo") return "#198754";
    else "#0d6efd"
}

function pathHover() {
    const allPaths = document.querySelectorAll(".path")
    console.log(allPaths)
    allPaths.forEach(p => {
        var myDiv
        p.onmouseover = (evt) => {
            console.log(evt)
            myDiv = document.createElement('div');
            myDiv.classList.add("bg-white")
            myDiv.classList.add("p-2")
            myDiv.classList.add("d-inline")
            myDiv.style.cssText = `
            position:absolute;
            left: ${evt.clientX - myDiv.offsetWidth / 2}px; top: ${evt.clientY - 50}px;
          `;
            myDiv.innerText = `${p.dataset.efectividad}`
            console.log(myDiv.width)
            document.body.appendChild(myDiv)
        }
        p.onmousemove = (evt) => {
            myDiv.style.cssText = `
            position:absolute;
            left: ${evt.pageX - myDiv.offsetWidth / 2}px; top: ${evt.pageY - 50}px;
          `;
        }
        p.onmouseleave = (evt) => {
            myDiv.remove()
        }
    })
}


const dst = d3
    .scaleTime()
    .domain([new Date("2019-03-31 00:00:00"), new Date("2019-03-31 10:00:00")])


function visualizeTicks(scale, tickArguments) {
    const height = 60, m = width > 599 ? 90 : 10;

    if (tickArguments === undefined) tickArguments = [];

    scale.range([m, width - m])

    let svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)

    console.log(tickArguments)
    svg.append("g").call(d3.axisBottom(scale).ticks(...tickArguments))

    console.log(svg)



    return svg.node();
}



window.onload = () => {
    let area = document.querySelector("#area")
    let timeline = document.querySelector("#timeline")


    const svg = visualizeTicks(dst, [10, d3.timeFormat("%I %p")])

    d3.select(svg)
        .append("text")
        .attr("fill", "black")
        .attr("x", dst(new Date("2019-03-31 01:57:00")) + "px")
        .attr("y", "40px")
        .text("la")
        .attr("text-anchor", "middle")
        .clone(true).lower()
        .attr("stroke", "white")

    area.appendChild(graph(root))
    timeline.appendChild(svg)


    pathHover()
}