"use strict";

let target = "Slide";
let leftTarget = "SlideLeft";
let rightTarget = "SlideRight";
let selectorTarget = "SlideSelector";
let transitionTime = "750ms";


class Slide {
    constructor(slideElement) {
        this.slideElement = slideElement;
        this.imagesContainer = slideElement.getElementsByTagName("ul")[0];
        if(!this.imagesContainer) {
            this.imagesContainer = slideElement.getElementsByTagName("ol")[0];
        }

        this.images = this.imagesContainer.getElementsByTagName("li");
        this.imageWidth = this.images[0].getBoundingClientRect().width;

        // Control button assignment
        this.leftButton = slideElement.getElementsByClassName(leftTarget)[0];
        this.rightButton = slideElement.getElementsByClassName(rightTarget)[0];
        
        this.controlButtons = [];
        if(slideElement.getElementsByClassName(selectorTarget)[0]) {
            this.controlButtons = slideElement.getElementsByClassName(selectorTarget)[0].children;
        }

        if(this.leftButton) {
           this.leftButton.addEventListener("click" , leftHandler , false); 
        }

        if(this.rightButton) {
            this.rightButton.addEventListener("click" , rightHandler , false);
        }

        // Give event listener to each selector
        for(let i = 0; i < this.controlButtons.length; i ++) {
            this.controlButtons[i].addEventListener("click" , () => {
                this.moveTo(i);
            } , false);
        }


        // Current image being displayed by slideshow
        this.currentImgIndex = 0;
        this.numImg = this.images.length;

        // Global styling
        this.imagesContainer.style.transition = "transform " + transitionTime;
    }

    left() {
        this.moveTo(this.currentImgIndex - 1);
    }
    
    right () {
        this.moveTo(this.currentImgIndex + 1);
    }

    moveTo(slideNum) {
        if(slideNum < 0) {
            slideNum = this.images.length - 1;
        } 
        else if (slideNum >= this.images.length) {
            slideNum = 0;
        }

        this.imagesContainer.style.transform = "translateX(-" + slideNum * this.imageWidth + "px)";
        this.currentImgIndex = slideNum;
    }

    setImageWidth() {
        this.imageWidth = this.images[0].getBoundingClientRect().width;
    }
}


let slideshows = [];

function leftHandler() {
    slideshows[this.closest("." + target).SlideID].left();
}

function rightHandler() {
    slideshows[this.closest("." + target).SlideID].right();
}


window.addEventListener('load', function() {

    let slideshowElements = document.getElementsByClassName(target);

    for(let i = 0; i < slideshowElements.length; i ++) {
        let slideshowElement = slideshowElements[i];
        slideshowElement.SlideID = i;
        slideshows[i] = new Slide(slideshowElement);
    }

}, false);


window.addEventListener('resize' , function() {

    for(let i = 0; i < slideshows.length; i ++) {
        slideshows[i].setImageWidth();

        // To unbreak it on resize
        slideshows[i].left();
        slideshows[i].right();
    }

}, false);