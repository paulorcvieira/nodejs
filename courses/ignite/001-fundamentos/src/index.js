const express = require('express')

const app = express()
app.use(express.json())

courses = [
  { id: '1', title: 'Curso 01', status: true},
  { id: '2', title: 'Curso 02', status: true},
  { id: '3', title: 'Curso 03', status: true},
]

app.get('/courses', (request, response) => {
  return response.json(courses)
})

app.post('/courses', (request, response) => {
  const { title } = request.body

  coursesLen = courses.length()

  createCourse = Object.assign(courses, {
    id: coursesLen + 1,
    title,
    status: true
  })

  return response.json(createCourse)
})

app.put('/courses/:id', (request, response) => {
  const { id } = request.params
  const { title } = request.body

  updateCourse = courses.map((course) => {
    if (course.id === id) {
      course.title = title
      return course
    }
    return course
  })

  return response.json(updateCourse)
})

app.patch('/courses/:id', (request, response) => {
  const { id } = request.params

  updateCourse = courses.map(course => {
    if (course.id = id) {
      status = !course.status

      return course
    }

    return course
  })

  return response.json(updateCourse)
})
app.delete('/courses/:id', (request, response) => {
  const { id } = request.params

  const deleteCourse = courses.filter(course => course.id !== id)

  return response.json(deleteCourse)
})

app.listen(3333, () => {
  console.log('Server started!')
})