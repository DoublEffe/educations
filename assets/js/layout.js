import {regioni, keys} from './data.js'



async function bookReadingApi(id) {
  let request = await axios.get(`https://test-proxy-9wel.onrender.com/info/${id}`)
  return JSON.parse(request.data).data.dataSets[0].series['0:0:0:0:0:0:0:0'].observations['0'][0]
}

async function bookCategoryApi(category) {
  let url = await axios.get(`https://openlibrary.org/subjects/${category}.json?details=false`, {headers:{'Accept':'application/json'}})
  return url.data.works
}

async function bookDescriptionApi(key) {
  let url = await axios.get(`https://openlibrary.org${key}.json`, {headers:{'Accept':'application/json'}})
  let desc = url.data.description
  let numberOfCategory = url.data.subjects.length
  if (typeof(url.data.description) === 'object'){
    desc = url.data.description.value
    return {desc, numberOfCategory}
  }
  return {desc, numberOfCategory}
}

function createElement(elem) {
  return document.createElement(elem)
}

function createElementN(s, elem) {
  return document.createElementNS(s, elem)
}

async function istat(name){
  let arr = []
  try{
    const peopleReading = await bookReadingApi(name)
    arr.push(peopleReading)
    arr = arr.map(x => !x ? 'N.D.' : x)
    return arr
  }catch (e){
    alert('Error: '+ e)
  }
}

//div that contains everything
let mainDiv = createElement('div')
document.body.appendChild(mainDiv)
mainDiv.setAttribute('class', 'main')

//map of italy
let map = createElementN('http://www.w3.org/2000/svg','svg')
map.setAttribute('version', '1.1')
map.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
map.setAttribute('x', '0px')
map.setAttribute('y', '0px')
map.setAttribute('class', 'map')
map.setAttribute('viewBox', '0 0 560.512 663.114')
map.setAttribute('xml:space', 'preserve')
let g = createElementN('http://www.w3.org/2000/svg','g')
let defs = createElement('defs')
map.appendChild(defs)
map.appendChild(g)
for (let i=0; i < 20;i++){
  let path = createElementN('http://www.w3.org/2000/svg','path')
  //path.setAttribute('fill','#3E5C73')
  path.setAttribute('class','regione')
  path.setAttribute('data-nome-regione',keys[i])
  path.setAttribute('data-code-regione',regioni[keys[i]].code)
  path.setAttribute('d',regioni[keys[i]].path)
  g.appendChild(path)
  path.onclick = async () => {
    let paths = document.querySelectorAll('path')
    paths.forEach((path) => {
      path.classList.remove('selected')
      path.style.fill = '#3E5C73'
    })
    path.setAttribute('id', 'tooltip')
    path.setAttribute('class', 'selected')
    path.style.fill = 'white'
  }
  
  let tooltip = tippy(path)
  tooltip.setProps({
    allowHTML: true,
    trigger: 'click',
    async onTrigger(){
      let arr = await istat(path.dataset.codeRegione)
      tooltip.setContent(`<p><bold>${path.dataset.nomeRegione}</bold></p><p>people reading a book from 6 years old: ${arr[0]}</p>`)
    }
  })
}
mainDiv.appendChild(map)

//search bar
let formDiv = createElement('div')
let form = createElement('form')
let searchDiv = createElement('div')
let searchBox = createElement('input')
let searchButton = createElement('button')
let infoDiv = createElement('div')
infoDiv.setAttribute('id', 'info')
formDiv.setAttribute('class', 'form-div')
searchDiv.setAttribute('class', 'search-div')
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
    bookBox(works)
  } catch(e){
    alert('Error: '+ e)
  }
}
searchBox.onfocusout = () => {
  formDiv.appendChild(infoDiv)
}
mainDiv.appendChild(formDiv)

//information after the search
const bookBox = (works) => {
  let bookDiv = createElement('div')
  bookDiv.setAttribute('id', 'info')
  formDiv.appendChild(bookDiv)
  //create a paragraph with title and authors element for each book
  works.forEach(book => {
    let title = createElement('p')
    title.setAttribute('class', 'book-title')
    title.innerText = 'Book Title: ' + book.title.toUpperCase()
    let p = createElement('p')
    p.setAttribute('class', 'book-info')
    p.innerText = 'Authors: '
    book.authors.forEach(author => {
      let authorText = createElement('p')
      authorText.innerText = author.name
      authorText.style.alignSelf = 'center'
      p.appendChild(authorText)
    })
    title.appendChild(p)
    bookDiv.appendChild(title)
    //showing the description for each book
    title.addEventListener('click', () => descBox(book.key, title))
  }) 
}

//description and canva that appear after clicking a book
const descBox = async (key, title) => {
  let descDiv = createElement('div')
  let graph = createElement('canvas')
  let p = createElement('p')
  descDiv.setAttribute('class', 'desc-div')
  graph.setAttribute('class', 'graph')
  try{
    let {desc, numberOfCategory} = await bookDescriptionApi(key)
    p.innerText = desc
    
    new Chart(graph, {
      type: 'bar',
      data: {
        labels: ['N.of book categories'],
        datasets: [{
          borderRadius: {topRight: 4, bottomRight: 4},
          labels: false,
          data: [numberOfCategory], 
        }]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'book numbers',
            font: {
              size: 20,
              weight: 800,
            }
          },
          legend: {
            display: false,
          },
        },
        indexAxis: 'y',
        scales: {
          y: {
            position: 'left',
            beginAtZero: true,
            ticks: {
              autoSkip: false,
              padding: 5,
              font: {
                size: 14,
                weight: 600,
              }
            },
            grid: {
              display: false
            },
            border: {
            display: true
            }
          },
          x:{
            display: true,
          }
        }
      }
    });
    descDiv.appendChild(p)
    descDiv.appendChild(graph)
  }
  catch (e){
     alert('Error: '+ e)
  }
  
  title.appendChild(descDiv)
  
}