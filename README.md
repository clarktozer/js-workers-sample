# Sample Web Workers and Service Workers project #

Sample project for using webworkers to process images and service workers to use offline. 

The code loads images and adds greyscale to each pixel of each image in a webworker. A service worker then caches the required files so it can work offline.

## How to run ##

```sh
npm install
npm start
```