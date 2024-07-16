const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person');
const errorHandler = require('./errorHandler');

app.use(express.static('build'));
app.use(express.json());
app.use(cors());
app.use(morgan('tiny'));
app.use(errorHandler);

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons);
  });
});

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch(error => {
      console.log(error);
      response.status(400).send({ error: 'malformatted id' });
    });
});

app.get('/info', async (request, response) => {
  try {
    const count = await Person.countDocuments({});
    const localDate = new Date();
    const formattedDate = localDate.toLocaleString();
    response.send(`<p>Phonebook has info for ${count} people</p><p>${formattedDate}</p>`);
  } catch (error) {
    console.error('Error counting persons:', error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
});


app.delete('/api/persons/:id', async (request, response) => {
  const id = request.params.id;

  try {
    const deletedPerson = await Person.findByIdAndDelete(id);

    if (!deletedPerson) {
      return response.status(404).json({ error: 'Person not found' });
    }

    response.status(204).end();
  } catch (error) {
    console.error('Error deleting person:', error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/api/persons/:id', async (request, response) => {
  const id = request.params.id;
  const body = request.body;

  const person = {
    name: body.name,
    number: body.number,
  };

  try {
    const updatedPerson = await Person.findByIdAndUpdate(id, person, { new: true });

    if (!updatedPerson) {
      return response.status(404).json({ error: 'Person not found' });
    }

    response.json(updatedPerson);
  } catch (error) {
    console.error('Error updating person:', error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/api/persons', (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'Name or number missing'
    });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person.save().then(savedPerson => {
    response.json(savedPerson);
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
