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
};


const image = document.querySelector(".example__compare");
const btn_prev = document.querySelector('.example__compare-slider_prev');
const btn_next = document.querySelector('.example__compare-slider_next');

 btn_prev.onclick = (e) => {
     image.classList.contains('example__compare_prev') ?
         null : image.classList.add('example__compare_prev');
     image.classList.contains('example__compare_next') ?
         image.classList.remove('example__compare_next') : null;
 };

btn_next.onclick = (e) => {
    image.classList.contains('example__compare_prev') ?
        image.classList.remove('example__compare_prev') : null;
    image.classList.contains('example__compare_next') ?
        null : image.classList.add('example__compare_next');
};



