const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
        .catch((err) => next(err))
    }
}

/*
const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next)
    } catch(error) {
        //res.status(err.code || 400).json({
       //     success: false,
       //     message: err.message
       // })

        next(error)
    }
}
*/

/// IMP- Arrow function implicit return used in second not in first we can used it like ///
/*
const asyncHandler = (requestHandler) => (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
        .catch((err) => next(err))
    }*/


module.exports = asyncHandler


/* 
   1. const asyncHandler = () => {}
   2. const asyncHandler = (func) => () => {}
   3. const asyncHandler = (func) => async () => {}
*/