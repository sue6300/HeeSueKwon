const box = document.getElementById('img-box');
let timeout;

function resetAnimation() {
    box.style.animation = 'none';
    box.offsetHeight;
    box.style.animation = '';
}

function handleMouseMove() {
    if (!box) return; // 첫 화면 외에는 #img-box가 없음
    clearTimeout(timeout);
    resetAnimation();
    timeout = setTimeout(() => {resetAnimation();}, 100);
}

document.addEventListener('mousemove', handleMouseMove);