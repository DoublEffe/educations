import {map} from './map.js'
import {formDiv} from './form.js'

//define the layout of the page
document.body.style.height = '100vh'
let mainDiv = document.createElement('div')
document.body.appendChild(mainDiv)
mainDiv.style.display = 'flex'
mainDiv.style.width = '100%'
mainDiv.style.height = '100%'
mainDiv.style.justifyContent = 'space-evenly'
//mainDiv.appendChild(map)
mainDiv.appendChild(formDiv)