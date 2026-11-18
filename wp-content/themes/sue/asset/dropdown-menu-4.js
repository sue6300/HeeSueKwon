$(document).ready(function() {
    // 펼친 메뉴 목록이 자동으로 닫히기까지의 시간 (밀리초). 60000 = 1분
    var AUTO_CLOSE_MS = 60000;

    // 마우스(hover)가 있는 기기인지. 터치 기기에서는 펼친 순간부터 카운트
    var canHover = window.matchMedia && window.matchMedia('(hover: hover)').matches;

    function stopTimer($item) {
        clearTimeout($item.data('closeTimer'));
    }

    function startTimer($item) {
        stopTimer($item);
        $item.data('closeTimer', setTimeout(function() {
            $item.find('.dropdown-content').hide();
        }, AUTO_CLOSE_MS));
    }

    $('.menu-item').on('click', function(e) {
        var $this = $(this);
        if ($(window).width() <= 600 && $this.attr('id') === '') {
            window.location.href = $this.find('a').attr('href');
        } else {
            var $dropdown = $this.find('.dropdown-content');
            $dropdown.toggle();
            if ($dropdown.is(':visible') && !(canHover && $this.data('hover'))) {
                startTimer($this);
            } else {
                stopTimer($this);
            }
        }
        e.stopPropagation();
    });

    // 마우스를 메뉴 위에 올려두는 동안에는 닫히지 않고, 벗어나면 다시 카운트
    $('.menu-item').on('mouseenter', function() {
        if (!canHover) return;
        $(this).data('hover', true);
        stopTimer($(this));
    }).on('mouseleave', function() {
        if (!canHover) return;
        var $this = $(this);
        $this.data('hover', false);
        if ($this.find('.dropdown-content').is(':visible')) {
            startTimer($this);
        }
    });

    $(document).on('click', function() {
        $('.dropdown-content').each(function() {
            if (!$(this).is(':visible')) {
                $(this).hide();
            }
        });
    });
});
