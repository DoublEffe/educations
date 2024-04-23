import {bookCategoryApi} from './network.js'
import { infoBox } from './infobox.js'

//create search bar and input button
let formDiv = document.createElement('div')
let form = document.createElement('form')
let searchDiv = document.createElement('div')
let searchBox = document.createElement('input')
let searchButton = document.createElement('button')
let infoDiv = document.createElement('div')
infoDiv.setAttribute('id', 'info')
formDiv.style.display = 'flex'
formDiv.style.flexDirection = 'column'
searchDiv.style.display = 'flex'
formDiv.appendChild(searchDiv)
formDiv.appendChild(infoDiv)
searchDiv.appendChild(form)
form.setAttribute('id', '#form')
form.appendChild(searchBox)
form.appendChild(searchButton)
searchButton.textContent = 'Search'
searchButton.setAttribute('type', 'submit')
searchBox.setAttribute('name', 'search-bar')
//remove the infbox with new search
searchBox.onfocus = () => {
  let infoDiv = document.getElementById('info')
  infoDiv.remove()
}
//create infobox when search a category
form.onsubmit = async (e) => {
  e.preventDefault()
  let formData = new FormData(form)
  let bookCategory = formData.get('search-bar')
  try{
    let works = await bookCategoryApi(bookCategory)
    infoBox(works)
  } catch(e){
    alert('Error: '+ e)
  }
}
searchBox.onfocusout = () => {
  formDiv.appendChild(infoDiv)
}


export {formDiv}