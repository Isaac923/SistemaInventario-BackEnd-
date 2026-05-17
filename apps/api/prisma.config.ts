const { defineConfig } = require('prisma/config')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')

require('dotenv').config()

module.exports = defineConfig({
  earlyAccess: true,
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrate: {
    async adapter() {
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      })
      return new PrismaPg(pool)
    },
  },
})