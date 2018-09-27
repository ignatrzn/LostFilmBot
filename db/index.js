const { Pool } = require('pg')

const DB_URI = process.env.DB_URI

const pool = new Pool({
  application_name: 'B2G-front',
  connectionString: DB_URI,
  ssl: true,
})

module.exports = {
  query: (text, params) => pool.query(text, params),
}
