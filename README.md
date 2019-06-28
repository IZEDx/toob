# node-preact-template

## Running from source

### Step 1: Clone project
```
$ git clone https://github.com/IZEDx/node-preact-template
$ cd node-preact-template
```

### Step 2: Install dependencies
```
$ npm i
```

### Step 3: Build project
```
$ npm run build
```

### (OPTIONAL) Step 3.5: Link project globally
```
$ npm link
```
Linking the 


### Step 4: Run project
From project root:
```
$ npm start
```

Via global link or npm -g:
```
$ node-preact-template
```

To keep the server running after closing the terminal sessions I suggest using [pm2](https://www.npmjs.com/package/pm2):
```
$ pm2 start node-preact-template
```