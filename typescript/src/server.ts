import express from 'express'

const app = express()

const start = async () => {
    try {
        app.listen(3000, () => console.log('Server running on port 3000'))
    } catch (error) {
        console.log(error)
    }
}

start()