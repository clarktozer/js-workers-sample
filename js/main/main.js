(function () {
    let imageContainer = document.getElementById("image-container");
    let generatedImages = imageContainer.querySelectorAll('img');
    let canvasContainer = document.getElementById("canvas-container");

    let initServiceWorker = async () => {
        if ('serviceWorker' in navigator) {
            try {
                var registration = await navigator.serviceWorker.register('service-worker.js');
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            } catch (e) {
                console.log('ServiceWorker registration failed: ', e);
            }
        }
    }

    let getImages = () => {
        return Array.from(generatedImages).map((img) => {
            return {
                src: img.getAttribute("data-image-src"),
                node: img
            };
        });
    }

    let loadImages = async (images) => {
        return Promise.all(images.map((img) => {
            return loadImage(img.node, img.src);
        }));
    }

    let loadImage = (img, src) => {
        return new Promise((resolve, reject) => {
            img.onload = function () {
                let imgCanvas = document.createElement("canvas");
                imgCanvas.width = img.width;
                imgCanvas.height = img.height;
                let canvasContext = imgCanvas.getContext('2d');
                canvasContext.drawImage(img, 0, 0);
                canvasContainer.appendChild(imgCanvas);
                resolve(imgCanvas);
            };
            img.onerror = function () {
                reject(new Error('Image not found: ' + src));
            };
            img.src = src;
        });
    }

    let processImages = async function () {
        let processingTimeStart = new Date();
        let images = await loadImages(getImages());
        let totalWorkerCount = images.length;
        let finished = 0;

        images.forEach((imageCanvas) => {
            let tempContext = imageCanvas.getContext("2d");

            let imageProcessingCompleted = function (e) {
                let canvasData = e.data.result;

                tempContext.putImageData(canvasData, 0, 0);
                finished++;

                if (finished == totalWorkerCount) {
                    let processingEndedTime = new Date() - processingTimeStart;
                    console.log("Image processing completed in: " + processingEndedTime + " ms");
                    let loader = document.querySelector('.lds-roller');
                    loader.classList.add('hidden');
                    canvasContainer.classList.remove('hidden');
                }
            };
            let worker = new Worker("js/workers/img-processor.js");
            worker.onmessage = imageProcessingCompleted;

            let canvasData = tempContext.getImageData(0, 0, imageCanvas.width, imageCanvas.height);
            worker.postMessage({
                data: canvasData,
                length: imageCanvas.width * imageCanvas.height * 4
            });
        })
    }

    initServiceWorker();
    processImages();
})();