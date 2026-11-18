// JavaScript to copy text content from span to ::before content
document.addEventListener("DOMContentLoaded", () => {
    const span = document.querySelector('.text-shadow');
    const text = span.textContent;

// Create a style element to dynamically insert CSS
    const style = document.createElement('style');
    style.textContent = `
        .text-shadow::before {
            content: '${text}';
        }
    `;
    document.head.appendChild(style);
});
