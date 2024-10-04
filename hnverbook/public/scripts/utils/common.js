'use strict'
// Auto resize the textarea whenever user exceed current height
export function autoResize() {
    this.style.height = 'auto';
    this.style.height = `calc(${this.scrollHeight}px + .5lh)`;
}