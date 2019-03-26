const sliderElem = document.querySelector('.example__compare-indicator');
const thumbElem = document.querySelector('.example__compare-thumb');

thumbElem.onmousedown = function(e) {
    const thumbCoords = getCoords(thumbElem);
    const shiftX = e.pageX - thumbCoords.left;

    const sliderCoords = getCoords(sliderElem);

	document.onmousemove = function(e) {
		const newLeft = e.pageX - shiftX - sliderCoords.left;

        if (newLeft < 0) {
            newLeft = 0;
        }

        const rightEdge = sliderElem.offsetWidth - thumbElem.offsetWidth;

        if (newLeft > rightEdge) {
            newLeft = rightEdge;
        }

        thumbElem.style.left = newLeft + 'px';
    };

    document.onmouseup = function() {
        document.onmousemove = document.onmouseup = null;
    };

    return false;
};

thumbElem.ondragstart = function() {
    return false;
};

function getCoords(elem) {
    const box = elem.getBoundingClientRect();

    return {
        top: box.top + pageYOffset,
        left: box.left + pageXOffset
    };

}