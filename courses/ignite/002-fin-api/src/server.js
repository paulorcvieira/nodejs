const express = require('express')
const { v4: uuidv4 } = require('uuid')

const app = express()

app.use(express.json())

const customers = []

// Middleware
const verifyIfExistAccountCpf = (request, response, next) => {
  const { cpf } = request.headers

  const customer = customers.find(customer => customer.cpf === cpf)

  if (!customer) {
    return  response.status(400).json({ error: 'Customer not found' })
  }

  request.customer = customer

  return next()
}

const getBalance = (statement) => {
  const balance = statement.reduce((acc, operation) => {
    if(operation.type === 'credit') {
      return acc + operation.amount
    } else {
      return acc - operation.amount
    }
  }, 0)

  return balance
}

// Middleware
// app.use(verifyIfExistAccountCpf)

app.get('/statement', verifyIfExistAccountCpf, (request, response) => {
  const { customer } = request

  return response.status(200).json(customer.statement)
})

app.post('/account', (request, response) => {
  const { cpf, name } = request.body

  const customersAlreadyExists = customers.some(customer =>
    customer.cpf === cpf
  )

  if (customersAlreadyExists) {
    return response.status(400).json({ error: 'Customer already exists.' })
  }

  customers.push({
    id: uuidv4(),
    name,
    cpf,
    statement: []
  })

  response.status(201).json({ customers, balance: 0 })

})

app.post('/accounts', verifyIfExistAccountCpf, (request, response) => {
  const accounts = request.body

  accounts.forEach(({ cpf }) => {
    const customersAlreadyExists = customers.some(customer =>
      customer.cpf === cpf
    )

    if (customersAlreadyExists) {
      return response.status(400).json({ error: 'Customer already exists.' })
    }
  })

  accounts.forEach(({ cpf, name }) => {
    customers.push({
      id: uuidv4(),
      name,
      cpf,
      statement: []
    })
  })

  response.status(201).json({ customers })

})

app.post('/deposit', verifyIfExistAccountCpf, (request, response) => {
  const { description, amount } = request.body

  const { customer } = request

  const statementOperation = {
    description,
    amount,
    type: 'credit',
    created_at: new Date(),
    updated_at: new Date(),
  }

  customer.statement.push(statementOperation)

  return response.status(201).json(customer)
})

app.post('/withdraw', verifyIfExistAccountCpf, (request, response) => {
  const { amount } = request.body
  const { customer } = request

  const balance = getBalance(customer.statement)

  if(balance < amount) {
    return response.status(400).json({ error: "Insufficient funds!" })
  }

  const statementOperation = {
    amount,
    type: 'debit',
    created_at: new Date(),
    updated_at: new Date(),
  }

  customer.statement.push(statementOperation)

  const newBalance = getBalance(customer.statement)

  return response.status(201).json({
    statement: statementOperation,
    balance: newBalance
  })
})

app.get('/statement/date', verifyIfExistAccountCpf, (request, response) => {
  const { date } = request.query
  const { customer } = request

  const dateFormat = new Date(date + " 00:00:00")

  const statement = customer.statement.filter(statement =>
    statement.created_at.toDateString() === new Date(dateFormat).toDateString()
  )

  return response.status(200).json(statement)
})

app.put('/account', verifyIfExistAccountCpf, (request, response) => {
  const { name } = request.body
  const { customer } = request

  customer.name = name

  return response.status(200).json()
})

app.get('/account', verifyIfExistAccountCpf, (request, response) => {
  const { customer } = request

  return response.status(200).json(customer)
})

app.delete('/account', verifyIfExistAccountCpf, (request, response) => {
  const { customer } = request

  customers.splice(customer, 1)

  return response.status(200).json(customers)
})

app.get('/balance', verifyIfExistAccountCpf, (request, response) => {
  const { customer } = request

  const balance =  getBalance(customer.statement)

  return response.status(200).json({ balance })
})

app.listen(3333, () => console.log('Server started!'))
