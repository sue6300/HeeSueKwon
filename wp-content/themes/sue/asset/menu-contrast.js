/*
 * 메뉴 글자/박스 자동 반전
 * 메뉴 글자 바로 아래에 있는 배경(사진·영상·배경색)의 밝기를 읽어서
 * 어두우면 .is-dark 클래스를 붙인다 → 흰 글자 (style.css)
 */
(function () {
    var DARK_BELOW = 0.42;   // 이보다 어두우면 반전
    var LIGHT_ABOVE = 0.52;  // 반전 상태에서 이보다 밝아지면 원래대로 (깜빡임 방지용 간격)
    var SAMPLE = 64;         // 이미지 밝기 계산용 축소 크기(px)

    var nav = document.getElementById('navbar-container');
    if (!nav || !document.elementsFromPoint) return;

    var samplers = {};       // 이미지 주소별 축소 캔버스 캐시

    function sameOriginUrl(src) {
        // www 유무 등 호스트만 다른 업로드 이미지는 현재 주소 기준으로 읽는다 (캔버스 보안 제한 회피)
        try {
            var u = new URL(src, location.href);
            if (u.origin !== location.origin && u.pathname.indexOf('/wp-content/') === 0) {
                return location.origin + u.pathname + u.search;
            }
            return u.href;
        } catch (e) { return src; }
    }

    function getSampler(img) {
        var src = img.currentSrc || img.src;
        if (!src) return null;
        var s = samplers[src];
        if (s) return s.ready ? s : null;
        s = samplers[src] = { ready: false, ok: false };
        var im = new Image();
        im.onload = function () {
            try {
                var w = SAMPLE, h = Math.max(1, Math.round(SAMPLE * im.naturalHeight / im.naturalWidth));
                var c = document.createElement('canvas');
                c.width = w; c.height = h;
                var ctx = c.getContext('2d');
                ctx.drawImage(im, 0, 0, w, h);
                s.data = ctx.getImageData(0, 0, w, h).data;
                s.w = w; s.h = h; s.ok = true;
            } catch (e) { s.ok = false; }
            s.ready = true;
        };
        im.onerror = function () { s.ready = true; s.ok = false; };
        im.src = sameOriginUrl(src);
        return null;
    }

    function lum(r, g, b) { return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; }

    // 이미지 위 한 점의 밝기 (주변 3x3 평균)
    function imageLum(img, x, y) {
        var s = getSampler(img);
        if (!s) return null;              // 아직 로딩 중
        if (!s.ok) return null;
        var r = img.getBoundingClientRect();
        if (!r.width || !r.height) return null;
        var px = Math.floor((x - r.left) / r.width * s.w);
        var py = Math.floor((y - r.top) / r.height * s.h);
        var sum = 0, n = 0;
        for (var dy = -1; dy <= 1; dy++) {
            for (var dx = -1; dx <= 1; dx++) {
                var X = Math.min(s.w - 1, Math.max(0, px + dx));
                var Y = Math.min(s.h - 1, Math.max(0, py + dy));
                var i = (Y * s.w + X) * 4;
                var a = s.data[i + 3] / 255;   // 투명 PNG는 흰 배경과 섞어서 계산
                sum += lum(s.data[i], s.data[i + 1], s.data[i + 2]) * a + (1 - a);
                n++;
            }
        }
        return sum / n;
    }

    function parseColor(c) {
        var m = c && c.match(/rgba?\(([^)]+)\)/);
        if (!m) return null;
        var p = m[1].split(',').map(parseFloat);
        var a = p.length > 3 ? p[3] : 1;
        if (a < 0.5) return null;
        return lum(p[0], p[1], p[2]);
    }

    // 요소 자신 또는 부모에서 처음 나오는 배경색의 밝기 (없으면 흰색)
    function backgroundLum(el) {
        while (el && el.nodeType === 1) {
            var l = parseColor(getComputedStyle(el).backgroundColor);
            if (l !== null) return l;
            el = el.parentElement;
        }
        return 1;
    }

    // 화면의 한 점 아래(메뉴를 제외한)의 밝기
    function pointLum(x, y) {
        if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) return null;
        var list = document.elementsFromPoint(x, y);
        for (var i = 0; i < list.length; i++) {
            var el = list[i];
            if (nav.contains(el)) continue;
            if (el.closest && el.closest('.video-background')) return 0;   // 첫 화면 영상: 검정
            if (el.tagName === 'IFRAME' || el.tagName === 'VIDEO') return 0.1;
            if (el.tagName === 'IMG') {
                var l = imageLum(el, x, y);
                if (l !== null) return l;
                continue;
            }
            return backgroundLum(el);
        }
        return 1;
    }

    function check(el) {
        var r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        var y = r.top + r.height / 2;
        var xs = [r.left + r.width * 0.15, r.left + r.width * 0.5, r.left + r.width * 0.85];
        var sum = 0, n = 0;
        for (var i = 0; i < xs.length; i++) {
            var l = pointLum(xs[i], y);
            if (l !== null) { sum += l; n++; }
        }
        if (!n) return;
        var avg = sum / n;
        var dark = el.classList.contains('is-dark');
        if (!dark && avg < DARK_BELOW) el.classList.add('is-dark');
        else if (dark && avg > LIGHT_ABOVE) el.classList.remove('is-dark');
    }

    var targets = nav.querySelectorAll('.menu-item > span, .dropdown-content a > span');

    function update() {
        for (var i = 0; i < targets.length; i++) {
            if (targets[i].offsetParent !== null) check(targets[i]);
        }
    }

    var queued = false;
    function schedule() {
        if (queued) return;
        queued = true;
        requestAnimationFrame(function () { queued = false; update(); });
    }

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    document.addEventListener('mousemove', schedule);
    document.addEventListener('click', function () { setTimeout(schedule, 0); });
    window.addEventListener('load', schedule);
    setInterval(update, 500);   // 이미지가 천천히 움직이는 첫 화면, 영상이 사라지는 순간 등
    update();
})();
