import {RequestHandler} from "express";

export default class Base {
    public postData: RequestHandler = (req, res) => {
        try {
            const requestData = req.body;

            console.log('body is ', requestData);

            res.json(requestData);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    public getData: RequestHandler = (req, res) => {
        try {
            console.log('body is ', req.body);

            res.json(req.body);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).send('Internal Server Error');
        }
    }
}