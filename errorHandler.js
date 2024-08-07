const errorHandler = (error, request, response, next) => {
    console.error('Error:', error.message);

    if (error.name === 'CastError' && error.kind === 'ObjectId') {
        return response.status(400).send({ error: 'Malformatted id' });
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message });
    }

    response.status(500).json({ error: 'Internal Server Error' });
    next(error);
};

module.exports = errorHandler;
