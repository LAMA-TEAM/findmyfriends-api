const routes = (app) => {
    app.get('/', (req, res) => {
        res.json({ message: 'Hello World!' });
    });


    app.use((req, res) => {
        res.status(404).send('404 Not Found');
    });
}

export default routes;