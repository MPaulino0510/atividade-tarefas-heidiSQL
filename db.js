import mariadb from 'mariadb';

function conectarBanco() {
    const con = mariadb.createPool({ // Conjunto
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });
    return con;
}

export default conectarBanco;