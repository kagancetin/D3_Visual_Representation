const addNew = (el) => {
  el.parentElement.insertAdjacentHTML('afterend', `<div class="input-group mb-3">
                <input name="extractNumber" type="text" class="form-control form-control-sm" placeholder="ex: BeginningBalance">
                <button class="btn btn-outline-secondary" type="button" onclick="addNew(this)">+</button>`)
}
$(document).ready(function () {
  $('#exportTable').DataTable({
    "aoColumns": [
      {"sType": "date-custom"},
      null
    ]
  })
})
const getMonthIdx = (month) => {
  month = month.toLowerCase()
  const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
  month = months.indexOf(month) + 1
  return month < 10 ? "0" + month : month
}
$.fn.dataTableExt.oSort['date-custom-asc'] = function (a, b) {
  var x = (a.slice(5, 9) + getMonthIdx(a.slice(0, 3)) + a.slice(3, 5)) * 1
  var y = (b.slice(5, 9) + getMonthIdx(b.slice(0, 3)) + b.slice(3, 5)) * 1
  return ((x < y) ? -1 : ((x > y) ? 1 : 0))
}

$.fn.dataTableExt.oSort['date-custom-desc'] = function (a, b) {

  var x = (a.slice(5, 9) + getMonthIdx(a.slice(0, 3)) + a.slice(3, 5)) * 1
  var y = (b.slice(5, 9) + getMonthIdx(b.slice(0, 3)) + b.slice(3, 5)) * 1

  return ((x < y) ? 1 : ((x > y) ? -1 : 0))
}

$(".modal").on('show.bs.modal', function (e) {
  console.log(e.relatedTarget)
  e.target.querySelector("#jsonForm").dataset.fileName = e.relatedTarget.dataset.fileName
  e.target.querySelector("#jsonForm").innerHTML = `
             <div class="modal-body">
                    <div class="mb-3">
                        <small class="form-label">Please enter page numbers to delete. Seperate with
                            comma ","</small>
                        <input name="removePages" class="form-control form-control-sm" type="text"
                               placeholder="ex: 1,2,3" aria-label=".form-control-sm example">
                    </div>
                    <div class="mb-3">
                        <small class="form-label">Please enter names for extract number</small>
                        <div class="input-group mb-3">
                            <input name="extractNumber" type="text" class="form-control form-control-sm" placeholder="ex: BeginningBalance">
                            <button class="btn btn-outline-secondary" type="button" onclick="addNew(this)">+</button>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="submit" class="btn btn-primary">Save changes</button>
                </div>`
  // document.querySelector("#modal-media-name").innerText = e.relatedTarget.dataset.mediaName
  // document.querySelector("#media-delete-submit").onclick = () => {
  //     const path = `/instructor/media/delete`
  //     lessonPost(path, {_id: e.relatedTarget.dataset.mediaId}, (err, res) => {
  //         if (err) {
  //             console.log(err, "toaster ıvj")
  //         } else {
  //             document.querySelector(`#${e.relatedTarget.dataset.mediaType}TableArea-${e.relatedTarget.dataset.targetLessonId}`).innerHTML = null
  //         }
  //     })
  // }
})

const jsonSubmit = (e) => {
  e.preventDefault()
  const form = document.querySelector("#jsonForm")
  const formData = new FormData(form)
  console.log("formData", formData)
  const json = {}
  formData.forEach((value, key) => {
    if (key === "removePages") {
      json[key] = value.split(",")
    }
    if (key === "extractNumber") {
      if (json[key] === undefined) {
        json[key] = []
      }
      json[key].push(value)
    }
  })
  console.log(json)
  const xhr = new XMLHttpRequest()
  xhr.open("POST", "/export/json/" + form.dataset.fileName)
  xhr.setRequestHeader("Content-Type", "application/json")
  xhr.responseType = "json"
  xhr.send(JSON.stringify(json))
  xhr.onload = () => {
    console.log(xhr.response)
  }
}