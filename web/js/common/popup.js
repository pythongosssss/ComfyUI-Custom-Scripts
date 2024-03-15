import { $el, ComfyDialog } from "../../../../scripts/ui.js";
import { api } from "../../../../scripts/api.js";
import { addStylesheet } from "./utils.js";

addStylesheet(import.meta.url);

export class PopUp {
    constructor(element, options) {
        let name = options.name;
        this.activeOnHover = options.activeOnHover;
        this.maxMouseDistance = options.maxMouseDistance ? options.maxMouseDistance : 50;

        this.root = $el(`div.pysssss-popup`, {
            parent: document.body,
        });
        this.container = $el("div.pysssss-popup-container");
        
        if (name) {
            const header = $el("div.pysssss-popup-header");
            const headerLabel = $el("div.pysssss-popup-label")
            header.append(headerLabel);
            headerLabel.innerHTML = name;

            this.container.append(header);
        }

        this.content = $el("div.pysssss-popup-content");

        this.root.append(this.container);
        this.container.append(this.content);


        this.onRootMouseMoveBind = this.onRootMouseMove.bind(this);
        this.onRootClickBind = this.onRootClick.bind(this);
        this.onShowBind = this.show.bind(this);

        this.attach(element);
        this.hide();
    }

    /* (content) => {} */
    setContent(contentCallback) {
        contentCallback(this.content);
    }
    
    hide() {
        this.root.style.display = "none";

        this.root.removeEventListener('mousemove', this.onRootMouseMoveBind);
        this.root.removeEventListener('mousedown', this.onRootClickBind);
    }

    show() {
        this.root.style.display = "flex";

        this.validatePosition();

        this.root.addEventListener('mousemove', this.onRootMouseMoveBind);
        this.root.addEventListener('mousedown', this.onRootClickBind);
    }

    attach(element) {
        this.attachedElement = element;
        if (this.activeOnHover) {
            element.addEventListener('mouseenter', this.onShowBind);
        } else {
            element.addEventListener('mousedown', this.onShowBind);
        }
    }

    detach() {
        let element = this.attachedElement;
        if (this.activeOnHover) {
            element.removeEventListener('mouseenter', this.onShowBind);
        } else {
            element.removeEventListener('mousedown', this.onShowBind);
        }

        this.attachedElement = null;
    }

    inAttachedElement(event, x, y) {
        let rect = this.attachedElement.getBoundingClientRect();
        return rect.left <= x && x <= rect.right &&
               rect.top <= y && y <= rect.bottom;
    }   

    onRootMouseMove(event) {
        let mouseX = event.x;
        let mouseY = event.y;

        if (this.inAttachedElement(event, mouseX, mouseY)) {
            return;
        }
        
        let rect = this.container.getBoundingClientRect();
        
        /* If certain distance away from popup */
        const maxDistance = 50;
        if (rect.top - mouseY > this.maxMouseDistance || mouseY - rect.bottom > this.maxMouseDistance ||
            rect.left - mouseX > this.maxMouseDistance || mouseX - rect.right > this.maxMouseDistance
        ) {
            this.hide();
        }
    }

    onRootClick(event) {
        if (this.container.matches(":hover")) {
            return;
        }

        this.hide();
    }

    validatePosition() {
        /* Set to position of attached element*/
        let rect = this.attachedElement.getBoundingClientRect();
        let computedStyle = getComputedStyle(this.container);
        
        let buttonWidth = rect.right - rect.left;
        let buttonHeight = rect.top - rect.bottom;
        let windowWidth = window.innerWidth;
        let windowHeight = window.innerHeight;
        let containerWidth = parseFloat(computedStyle.width); 
        let containerHeight = parseFloat(computedStyle.height);

        let x = rect.left;
        let y = rect.top;

        this.container.style.left = `${x}px`;
        this.container.style.top = `${y - buttonHeight + 2}px`;

        /* Make sure popup is fully inside window */
        if (x + containerWidth > windowWidth) {
            this.container.style.left = `${rect.right - containerWidth - 10.0}px`;
        }

        if (y + containerHeight * 2.0 + (buttonHeight) > windowHeight) {
            this.container.style.top = `${rect.top - containerHeight - 10.0}px`;
        }
    }
}