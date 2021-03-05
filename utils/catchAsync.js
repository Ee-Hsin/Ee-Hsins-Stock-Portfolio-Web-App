module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next); //same as .catch(e => next(e))
    }
}