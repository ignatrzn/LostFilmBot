const { Pool } = require('pg')

const DATABASE_URL = process.env.DATABASE_URL

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: true,
})

module.exports = {
  query: (text, params) => pool.query(text, params),
}
