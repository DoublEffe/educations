import {Regions} from './data.js'


//api functions
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

//create element function
function createElementN(elem, attributeObj, appendTo) {
  let el 
  if (elem === 'svg' || elem === 'g' || elem === 'path') {
    el = document.createElementNS('http://www.w3.org/2000/svg', elem)
  }
  else {
    el = document.createElement(elem)
  }
  for(const [key, value] of Object.entries(attributeObj)) {
    if(key === 'class') {
      el.classList.add(...value)
    }
    else{el.setAttribute(key, value)}
  }
  appendTo.appendChild(el)
  return el
}

// map functions
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

function drawMap(g) {
  let regions = new Regions()
  for (let i=0; i < regions.getLength(); i++){
    let obj = {
      'fill': '#3E5C73',
      'class': ['regione'],
      'data-nome-regione': regions.getNames(i),
      'data-code-regione': regions.getCode(i),
      'd': regions.getPath(i)
    }
    let path = createElementN('path', obj, g)
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
        tooltip.setContent('<div class="loader"></div>')
        let arr = await istat(path.dataset.codeRegione)
        tooltip.setContent(`<p><bold>${path.dataset.nomeRegione}</bold></p><p>people reading a book above 6 years old: ${arr[0]}</p>`)
      }
    })
  }
}

//cards functions
function showHide(show, detailPanelsIndex, key, bookDiv) {
  show.addEventListener('click', () => {
    if(detailPanelsIndex) {
      detailPanelsIndex = false
      let descDiv = document.getElementById('desc')
      descDiv.remove()
      show.innerText = 'Show Details'
    }
    else{
      show.innerText = 'Hide Details'
      detailPanelsIndex = true
      descBox(key, bookDiv, show)
    }
  })
}

//chart options
const chartOptions = (chart, numberOfCategory) => {
  new Chart(chart, {
    type: 'bar',
    data: {
      labels: ['N.of book categories'],
      datasets: [{
        borderRadius: {topRight: 4, bottomRight: 4},
        labels: false,
        data: [numberOfCategory], 
        color: '#fff',
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'book numbers',
          color: '#fff',
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
            color: '#fff',
            font: {
              size: 14,
              weight: 600,
            }
          },
          grid: {
            display: false,
            color: '#fff',
          },
          border: {
            display: true
          }
        },
        x:{
          display: true,
          ticks: {
            color: '#fff'
          },
          grid: {
            color: '#fff',
          }
        }
      }
    }
  })
}

//div that contains everything
let body = document.getElementsByTagName('body')[0]


//information after the search
const bookBox = (works) => {
  let booksDiv = createElementN('div', {'id': 'info'}, mainDiv)
  //create a paragraph with title and authors element for each book
  let detailPanels = {}
  works.forEach((book, i) => {
    detailPanels[i] = false
    let bookDiv = createElementN('div', {'class': ['card', 'my-2']}, booksDiv)
    let bookBody = createElementN('div', {'class': ['card-body']}, bookDiv)
    let bookTitle = createElementN('h5', {'class': ['book-title']}, bookBody)
    bookTitle.innerText = book.title.toUpperCase()
    book.authors.forEach(author => {
      let authorText = createElementN('p', {'class': ['card-text']}, bookBody)
      authorText.innerText = author.name
    })
    let brake = createElementN('div', {'class': ['brake']}, bookBody)
    let show = createElementN('div', {'class': ['card-text'], 'id': 'details'}, bookBody)
    show.innerText = 'Show Details'
    //showing the description for each book
    showHide(show, detailPanels[i], book.key, bookDiv)
  }) 
}

//description and canva that appear after clicking show details
const descBox = async (key, bookDiv, show) => {
  let descDiv = createElementN('div', {'class': ['card-body'], 'id': 'desc'}, bookDiv)
  let p = createElementN('p', {'class': ['card-text']}, descDiv)
  let graph = createElementN('canvas', {'class': ['w-75', 'h-25']}, descDiv)
  try{
    let {desc, numberOfCategory} = await bookDescriptionApi(key)
    p.innerText = desc
    chartOptions(graph,numberOfCategory)
  }
  catch (e){
     alert('Error: '+ e)
  } 
}

//map of Italy
const map = () => {
  let obj = {}
  obj = {'version': '1.1', 
        'xmlns': 'http://www.w3.org/2000/svg',
        'x': '0px',
        'y': '0px',
        'class': ['col'],
        'viewBox': '0 0 560.512 663.114',
        'xml:space': 'preserve'
      }
  let map = createElementN('svg', obj, mainDiv)
  let g = createElementN('g', {}, map)
  let defs = createElementN('defs', {}, map)
  drawMap(g)
}


//navbar
let nav = createElementN('nav', {'class': ['navbar']}, body)
let div = createElementN('div', {'class': ['container-fluid', 'justify-content-center']}, nav)
let gotToMap = createElementN('a', {'class': ['navbar-brand'], 'id': 'map'}, div)
gotToMap.innerText = 'MAP'
let form = createElementN('form', {'id': '#form', 'class': ['d-flex']}, div)
let input = createElementN('input', {'name': 'search-bar', 'class': ['form-control', 'form-control-lg', 'mx-1'], 'placeholder': 'Category', 'id': 'input'}, form)
let searchButton = createElementN('button', {'type': 'submit', 'class': ['btn', 'btn-primary'], 'id': 'search'}, form)
searchButton.setAttribute('disabled', 'true')
searchButton.innerText = 'Search'

//append/remove div for the content if thre is already one or not
let mainDiv
const handleMainDiv = () => {
  if(mainDiv) {
    mainDiv.remove()
  }
  mainDiv = createElementN('div', {'class': ['container'], 'id': 'info'}, body)
}

//navbar events variables
const search = async () => {
  try{
    let works = await bookCategoryApi(input.value)
    if(works.length === 0) {
      throw new Error('This category is not present')
    }
    bookBox(works)
  } catch(e){
    alert(e)
}}
input.oninput= () => {
  if(input.value.length >= 4) {
    searchButton.removeAttribute('disabled')
  }
  else {
    searchButton.setAttribute('disabled', 'true')
  }
}
const pageEvents = {
  'map':  map,
  'search':  search,
  'input': input.oninput
}

//logic of the navbar
div.addEventListener('click', (event) => {
  let click = event.target.getAttribute('id')
  event.preventDefault()
  handleMainDiv()
  pageEvents[click]()
  input.value = ''
})