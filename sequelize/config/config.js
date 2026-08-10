require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

const schemaConfig = require(__dirname + '/schema.js');
module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    schema: schemaConfig.name,
    migrationStorageTableSchema: schemaConfig.name,
    seederStorage: 'sequelize',
    timezone: '+07:00',
  },
  staging: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    schema: schemaConfig.name,
    migrationStorageTableSchema: schemaConfig.name,
    seederStorage: 'sequelize',
    timezone: '+07:00',
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    schema: schemaConfig.name,
    migrationStorageTableSchema: schemaConfig.name,
    seederStorage: 'sequelize',
  },
};