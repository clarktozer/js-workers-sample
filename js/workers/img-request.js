onmessage = (e) => {
    console && console.log('fetching images');
    fetchImages(e.data);
}

const fetchImages = async (images) => {
    await Promise.all(images.map(j =>
        fetch(j.src, {
            method: 'GET',
            mode: 'no-cors',
            cache: 'default'
        })
        .then(resp => resp.blob())
    ));

    postMessage(images.map(i => {
        return i.id
    }))
}