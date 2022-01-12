//selecting all required elements
const dropArea = document.querySelector(".drag-area"),
  dragText = dropArea.querySelector("header"),
  button = dropArea.querySelector("button"),
  input = dropArea.querySelector("input")
let file //this is a global variable and we'll use it inside multiple functions

button.onclick = () => {
  input.click() //if user click on the button then the input also clicked
}

input.addEventListener("change", function () {
  //getting user select file and [0] this means if user select multiple files then we'll select only the first one
  file = this.files[0]
  dropArea.classList.add("active")
  uploadFile(file)
})

//If user Drag File Over DropArea
dropArea.addEventListener("dragover", (event) => {
  event.preventDefault() //preventing from default behaviour
  dropArea.classList.add("active")
  dragText.textContent = "Release to Upload File"
})

//If user leave dragged File from DropArea
dropArea.addEventListener("dragleave", () => {
  dropArea.classList.remove("active")
  dragText.textContent = "Drag & Drop to Upload File"
})

//If user drop File on DropArea
dropArea.addEventListener("drop", (event) => {
  event.preventDefault() //preventing from default behaviour
  //getting user select file and [0] this means if user select multiple files then we'll select only the first one
  file = event.dataTransfer.files[0]
  uploadFile(file)
})

const uploadFile = (file) => {
  const formData = new FormData()
  formData.append("file", file)
  const xhr = new XMLHttpRequest()
  xhr.open("POST", "/upload", true)
  xhr.responseType = "json"
  const loading = document.querySelector("#loadingPage")
  xhr.onloadstart = () => {
    document.body.style.pointerEvents = "none"
    loading.classList.remove("d-none")
  }
  xhr.onload = () => {
    console.log(xhr.response)
    window.open('/export/' + xhr.response.name, '_blank')
    loading.classList.add("d-none")
    document.body.style.pointerEvents = "auto"

  }
  xhr.onerror = e => {
    console.log("error", xhr.response)
    loading.classList.add("d-none")
    document.body.style.pointerEvents = "auto"
  }
  xhr.send(formData)
}