var start = new Date();

fetch("http://www.splashbase.co/api/v1/images/latest", {
    method: 'GET'
}).then(response => {
    return response.json();
}).then((json) => {
    var generated = document.getElementById("generated");

    var domImages = json.images.reduce((images, img) => {
        const image = new Image();
        var newImg = document.createElement("img");
        newImg.setAttribute("data-image-src", img.url)
        generated.appendChild(newImg);

        images[img.id] = {
            id: img.id,
            src: img.url,
            node: newImg,
            image
        };

        return images;
    }, {});

    let imgWorker = new Worker("js/workers/img-request.js");
    imgWorker.onmessage = function (e) {
        e.data.forEach((d) => {
            const {
                src,
                node
            } = domImages[d];
            node.src = src;
        })
    };

    imgWorker.postMessage(
        Object.keys(domImages).map(id => {
            return {
                id,
                src: domImages[id].src
            };
        })
    );
})