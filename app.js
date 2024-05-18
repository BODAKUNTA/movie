const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'moviesData.db')

let db = null

const getDateFromServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('It is executed')
    })
  } catch (e) {
    console.log('DB Error: ${e.message}')
    process.exit(1)
  }
}
getDateFromServer()

const converDbobjects = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}
const converDbobjectsResponse = dbObject1 => {
  return {
    directorId: dbObject1.director_id,
    directorName: dbObject1.director_name,
  }
}

// GET API

app.get('/movies/', async (request, response) => {
  const getQuary = `
  SELECT
  movie_name
  FROM
  movie`
  const movieArray = await db.all(getQuary)
  response.send(movieArray.map(eachmovie => converDbobjects(eachmovie)))
})

//POST API

app.post('/movies/', async (request, response) => {
  const movieTable = request.body
  const {directorId, movieName, leadActor} = movieTable
  const postQuery = `
  INSERT INTO 
  movie (director_id,movie_name,lead_actor)
  VALUES 
  ("${directorId}",
    "${movieName}",
    "${leadActor}")`
  await db.run(postQuery)
  response.send('Movie Successfully Added')
})

//GET API

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getIdQueary = `
  SELECT
  *
  FROM
  movie
  WHERE
  movie_id = ${movieId}`
  const movieData = await db.get(getIdQueary)
  response.send(converDbobjects(movieData))
})

//PUT API

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const movieTable = request.body
  const {directorId, movieName, leadActor} = movieTable
  const updateQuery = `
  UPDATE
  movie
  SET
  director_id = "${directorId}",
  movie_name = "${movieName}",
  lead_actor = "${leadActor}"
  WHERE
  movie_id = ${movieId}
  `
  await db.run(updateQuery)
  response.send('Movie Details Updated')
})

//DELETE API

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteQuary = `
  DELETE 
  FROM
  movie
  WHERE
  movie_id = ${movieId}
  `
  await db.run(deleteQuary)
  response.send('Movie Removed')
})

// GET DIRECTOR API

app.get('/directors/', async (request, response) => {
  const getDireQuary = `
  SELECT 
  *
  FROM
  director
  `
  const director = await db.all(getDireQuary)
  response.send(director.map(eachDir => converDbobjectsResponse(eachDir)))
})

// GET DIRECTOR/MOVIES API

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getDirector = `
  SELECT 
  movie_name
  FROM
  director INNER JOIN movie
  ON director.director_id = movie.director_id
  WHERE
  director.director_id = ${directorId}
  `
  const director = await db.all(getDirector)
  response.send(director.map((each) => converDbobjectsResponse(each)))
})

module.exports = app
