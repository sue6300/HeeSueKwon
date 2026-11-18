/*
 * List 화면 무한 스크롤
 * 화면 아래 "......"가 보일 즈음 다음 썸네일 12개를 불러와 이어 붙인다.
 */
(function () {
    var grid = document.querySelector('.worklist-grid[data-ajax]');
    var loader = document.querySelector('.list-loader');
    if (!grid || !loader) return;

    var loading = false;
    var done = false;

    function finish() {
        done = true;
        if (loader.parentNode) loader.parentNode.removeChild(loader);
        window.removeEventListener('scroll', onScroll);
    }

    function loadMore() {
        if (loading || done) return;
        loading = true;
        loader.classList.add('is-loading');
        var body = 'action=hk_list_more'
            + '&cat=' + encodeURIComponent(grid.getAttribute('data-cat'))
            + '&offset=' + encodeURIComponent(grid.getAttribute('data-offset'));
        var xhr = new XMLHttpRequest();
        xhr.open('POST', grid.getAttribute('data-ajax'));
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onload = function () {
            loading = false;
            loader.classList.remove('is-loading');
            var res = null;
            try { res = JSON.parse(xhr.responseText); } catch (e) {}
            if (!res || !res.success) { finish(); return; }
            grid.insertAdjacentHTML('beforeend', res.data.html);
            grid.setAttribute('data-offset', res.data.offset);
            if (res.data.done) { finish(); return; }
            check(); // 화면이 커서 아직 바닥이 보이면 계속
        };
        xhr.onerror = function () { loading = false; loader.classList.remove('is-loading'); };
        xhr.send(body);
    }

    // 바닥에서 화면 높이 정도 남았을 때 미리 불러온다
    function check() {
        if (done) return;
        if (loader.getBoundingClientRect().top < window.innerHeight * 2) loadMore();
    }

    var ticking = false;
    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () { ticking = false; check(); });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    check();
})();
