export default () => ({
    debug: process.env.APP_DEBUG === "true",
    port: parseInt(process.env.PORT, 10) || 3000,
    github: {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
    },
    database: {
        host: process.env.DB_HOST,
        port: parseInt(process.env.PORT, 10) || 5432,
        username: process.env.DB_USERNAME || "postgres",
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
    },
    jwt_secret: process.env.JWT_SECRET,
});
