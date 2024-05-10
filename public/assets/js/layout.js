
import {Regions} from './data.js'



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


function createElementN(elem, attributeObj, appendTo) {
  let el 
  if (elem === 'svg' || elem === 'g' || elem === 'path') {
    el = document.createElementNS('http://www.w3.org/2000/svg', elem)
  }
  else {
    el = document.createElement(elem)
  }
  for(const [key, value] of Object.entries(attributeObj)) {
    el.setAttribute(key, value)
  }
  appendTo.appendChild(el)
  return el
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
let body = document.getElementsByTagName('body')[0]
let mainDiv = createElementN('div', {'class': 'main'}, body)


//map of italy
let obj = {}
obj = {'version': '1.1', 
      'xmlns': 'http://www.w3.org/2000/svg',
      'x': '0px',
      'y': '0px',
      'class': 'map',
      'viewBox': '0 0 560.512 663.114',
      'xml:space': 'preserve'
    }
let map = createElementN('svg', obj, mainDiv)
let g = createElementN('g', {}, map)
let defs = createElementN('defs', {}, map)
let regions = new Regions()
for (let i=0; i < 20;i++){
  obj = {
    'fill': '#3E5C73',
    'class': 'regione',
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
      let arr = await istat(path.dataset.codeRegione)
      tooltip.setContent(`<p><bold>${path.dataset.nomeRegione}</bold></p><p>people reading a book above 6 years old: ${arr[0]}</p>`)
    }
  })
}


//search bar
let formDiv = createElementN('div', {'class': 'form-div'}, mainDiv)
let searchDiv = createElementN('div', {'class': 'search-div'}, formDiv)
let form = createElementN('form', {'id': '#form'}, searchDiv)
let searchBox = createElementN('input', {'name': 'search-bar'}, form)
let searchButton = createElementN('button', {'type': 'submit'}, form)
let infoDiv = createElementN('div', {'id': 'info'}, formDiv)
searchButton.textContent = 'Search'
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


//information after the search
const bookBox = (works) => {
  let booksDiv = createElementN('div', {'id': 'info'}, formDiv)
  //create a paragraph with title and authors element for each book
  let detailPanels = {}
  works.forEach((book, i) => {
    detailPanels[i] = false
    let bookDiv = createElementN('div', {'class': 'book-div'}, booksDiv)
    bookDiv.innerText = 'Book Title: ' + book.title.toUpperCase()
    let authorsDiv = createElementN('div', {'class': 'authors-div'}, bookDiv)
    authorsDiv.innerText = 'Authors: '
    book.authors.forEach(author => {
      let authorText = createElementN('p', {'class': 'authors'}, authorsDiv)
      authorText.innerText = author.name
    })
    let brake = createElementN('div', {'class': 'brake'}, bookDiv)
    let show = createElementN('div', {'class': 'show'}, bookDiv)
    show.innerText = 'Show Details'
    //showing the description for each book
    show.addEventListener('click', () => {
      if(detailPanels[i]) {
        detailPanels[i] = false
        let descDiv = document.querySelector('.desc-div')
        descDiv.remove()
        show.innerText = 'Show Details'
      }
      else{
        show.innerText = 'Hide Details'
        detailPanels[i] = true
        descBox(book.key, bookDiv, show)
      }
    });
  }) 
}

//description and canva that appear after clicking a book
const descBox = async (key, bookDiv, show) => {
  let descDiv = createElementN('div', {'class': 'desc-div'}, bookDiv)
  let p = createElementN('p', {}, descDiv)
  let graph = createElementN('canvas', {'class': 'graph'}, descDiv)
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
  }
  catch (e){
     alert('Error: '+ e)
  } 
}