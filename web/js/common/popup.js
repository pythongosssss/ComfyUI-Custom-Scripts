import { $el, ComfyDialog } from "../../../../scripts/ui.js";
import { api } from "../../../../scripts/api.js";
import { addStylesheet } from "./utils.js";

addStylesheet(import.meta.url);

export class PopUp {
    constructor(element, options) {
        let name = options.name;
        this.activeOnHover = options.activeOnHover;

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


        this.onContainerLeaveBind = this.onContainerLeave.bind(this);
        this.onRootClickBind = this.onRootClick.bind(this);
        this.onShowBind = this.show.bind(this);
        // this.onHideBind = this.hide.bind(this);

        this.attach(element);
        this.hide();
    }

    /* (content) => {} */
    setContent(contentCallback) {
        contentCallback(this.content);
    }
    
    hide() {
        this.root.style.display = "none";

        this.container.removeEventListener('mouseleave', this.onContainerLeaveBind);
        this.root.removeEventListener('mousedown', this.onRootClickBind);
    }

    show() {
        this.root.style.display = "flex";

        this.validatePosition();

        this.container.addEventListener('mouseleave', this.onContainerLeaveBind);
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

    onContainerLeave(event) {
        this.hide();
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
        
        let windowWidth = window.innerWidth;
        let windowHeight = window.innerHeight;
        let containerWidth = parseFloat(computedStyle.width); 
        let containerHeight = parseFloat(computedStyle.height);

        let x = rect.left;
        let y = rect.top;

        this.container.style.left = `${x}px`;
        this.container.style.top = `${y - (rect.top - rect.bottom) + 4}px`;

        /* Make sure popup is fully inside window */
        if (x + containerWidth > windowWidth) {
            this.container.style.left = `${windowWidth - containerWidth * 2.0 - (rect.left - rect.right) * 2.0}px`;
        }

        if (y + containerHeight > windowHeight) {
            this.container.style.top = `${windowHeight - containerHeight * 2.0 - 4}px`;
        }
    }
}