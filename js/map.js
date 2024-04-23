import {regioni, keys} from './data.js'
import { bookReadingApi} from './network.js'







async function istat(name){
  let arr = []
  try{
    bookReadingApi()
    arr = arr.map(x => !x ? 'N.D.' : x)
    return arr
  }catch (e){
    alert('Error: '+ e)
  }
}

let map = document.createElementNS('http://www.w3.org/2000/svg','svg')
map.setAttribute('version', '1.1')
map.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
map.setAttribute('x', '0px')
map.setAttribute('y', '0px')
map.style.width = '560.512px'
map.style.height = '663.114px'
map.style.display = 'block'
map.setAttribute('viewBox', '0 0 560.512 663.114')
map.setAttribute('xml:space', 'preserve')
let g = document.createElementNS('http://www.w3.org/2000/svg','g')
let defs = document.createElement('defs')
//document.body.appendChild(svg)
map.appendChild(defs)
map.appendChild(g)
for (let i=0; i < 20;i++){
  let path = document.createElementNS('http://www.w3.org/2000/svg','path')
  path.setAttribute('fill','#3E5C73')
  path.setAttribute('class','regione')
  path.setAttribute('data-nome-regione',keys[i])
  path.setAttribute('stroke','#3E5C73')
  path.setAttribute('stroke-width','2')
  path.setAttribute('stroke-miterlimit','10')
  path.setAttribute('d',regioni[keys[i]].path)
  path.style.transition = 'all 200ms ease-in-out'
  path.style.position = 'relative'

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
      let arr = await istat(path.dataset.nomeRegione)
      tooltip.setContent(`<p><bold>${path.dataset.nomeRegione}</bold></p><p>unemployment rate: ${arr[0]}</p><p>mean wage: ${arr[1]}</p><p>life expectation: ${arr[2]}</p><p>homicide: ${arr[3]}</p>`)
    }
  })
}


export {map}