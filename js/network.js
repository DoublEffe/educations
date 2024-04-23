
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

async function bookReadingApi() {
  let request = await axios.get('https://esploradati.istat.it/SDMXWS/rest/data/IT1,83_63_DF_DCCV_AVQ_PERSONE_235,1.0/A.ITC1.6_BOOK_W.THV..../ALL/?detail=full&startPeriod=2022-01-01&endPeriod=2022-12-31&dimensionAtObservation=TIME_PERIOD', {headers:{'Accept':'application/sdmx', 'Access-Control-Allow-Origin': '*'}})
  //console.log(request.status)
}

export {bookCategoryApi, bookDescriptionApi, bookReadingApi}