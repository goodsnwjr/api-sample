module.exports = {
  db: {
    name: 'db',
    connector: 'memory'
  },
  mongoDs: {
    host: process.env.CPP_DB_HOST,
    port: process.env.CPP_DB_PORT,
    database: process.env.CPP_DB_COLLECTION,
    password: process.env.CPP_DB_PASS,
    url: false,
    name: 'mongoDs',
    user: process.env.CPP_DB_ID,
    connector: 'mongodb',
    useNewUrlParser: 'true'
  }
};
