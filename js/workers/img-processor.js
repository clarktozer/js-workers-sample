self.onmessage = (message) => {
    var canvasData = message.data.data;
    var binaryData = canvasData.data;
    var length = message.data.length;

    greyScaleImage(binaryData, length);
    self.postMessage({ 
        result: canvasData,
    });
};

const greyScaleImage = (binaryData, length) => {
    for (var i = 0; i < length; i += 4) {
        var avg = 0.34 * binaryData[i] + 0.5 * binaryData[i + 1] + 0.16 * binaryData[i + 2];
        binaryData[i] = avg;
        binaryData[i + 1] = avg;
        binaryData[i + 2] = avg;
    }
};