# Worker module

This is the worker module in charge of allocating resources for the new instances.

## Installation


Use the package manager [npm](https://www.npmjs.com/get-npm) to install all the project dependencies (base path):

```bash
npm install
```

Define a .env file at the worker/.env path containing the following:

```bash
AWS_ACCESS_KEY = //AWS access key
AWS_ACCESS_SECRET = //AWS secret
MONGO_URL = //Mongo url, same as used for the server module.
QUEUE_URL = //Full URL of the worker queue ending on .fifo
```
## Usage

Start the service by running:
```bash
npm start
```


## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)