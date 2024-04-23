import { formDiv } from "./form.js"
import { bookDescriptionApi } from "./network.js"

//description and canva that appear after clicking a book
const descBox = async (key, title) => {
  let descDiv = document.createElement('div')
  let canvas = document.createElement('canvas')
  let p = document.createElement('p')
  descDiv.style.width = '300px'
  canvas.style.width = '200px'
  canvas.style.height = '100px'
  try{
    let {desc, numberOfCategory} = await bookDescriptionApi(key)
    p.innerText = desc
    
    new Chart(canvas, {
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
    descDiv.appendChild(canvas)
  }
  catch (e){
     alert('Error: '+ e)
  }
  
  title.appendChild(descDiv)
  
}

const infoBox = (works) => {
  let infoDiv = document.createElement('div')
  infoDiv.setAttribute('id', 'info')
  formDiv.appendChild(infoDiv)
  infoDiv.style.width = '300px'
  infoDiv.style.height = '100vh'
  //create a paragraph with title and authors element for each book
  works.forEach(book => {
    let title = document.createElement('p')
    title.style.width = '500px'
    title.style.border = '2px solid grey'
    title.style.borderRadius = '5px'
    title.style.display = 'flex'
    title.style.flexDirection = 'column'
    title.style.alignItems = 'center'
    title.style.cursor = 'pointer'
    title.innerText = 'Book Title: ' + book.title.toUpperCase()
    let p = document.createElement('p')
    p.innerText = 'Authors: '
    p.style.display = 'flex'
    p.style.flexDirection = 'column'
    book.authors.forEach(author => {
      let authorText = document.createElement('p')
      authorText.innerText = author.name
      authorText.style.alignSelf = 'center'
      p.appendChild(authorText)
    })
    title.appendChild(p)
    infoDiv.appendChild(title)
    //showing the description for each book
    title.addEventListener('click', () => descBox(book.key, title))
    
  })
  
  //infoDiv.appendChild(canvas)
  /*let legendDiv = document.createElement('div')
  legendDiv.style.border = '5px solid black'
  const labels = ['carbon monoxide', 'condensation droplets', 'hydocarbons', 'nitrogen dioxide', 'particles', 'particles less than 10 micometers', 'particles less than 2.5 micometers', ]
  let p = document.createElement('p')
  p.innerText = 'LEGENDS'
  legendDiv.appendChild(p)
  labels.map((label, i) => {
    let p = document.createElement('p')
    p.innerText = names[i] + ' : ' + label
    legendDiv.appendChild(p)
  })
  infoDiv.appendChild(legendDiv)*/
}

export {infoBox}