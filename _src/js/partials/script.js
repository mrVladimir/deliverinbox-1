$(document).ready(function(event){

	/* SCROLL */

	// плавный скрол к хэшу после загрузки страницы
	setTimeout(function(){
		$('html, body').scrollTop(0);
		if (location.hash && location.hash !== '#main') setTimeout(function(){
			pageScroll(location.hash)
		}, 300);
	}, 1)

	if (!history.pushState) pageScroll = function() {
		// для старых браузеров, не поддерживающих пушСтейт
		location.hash = this.hash;
	}
	// плавный скрол к хэшу по клику
	$('a[href^=#]').on('click', function(event){
		event.preventDefault();
		pageScroll(this.hash);
	})
	
	var scrollMonitor = new ScrollMonitor();


	/* ВАЛИДАЦИЯ */

	var valid;

	$('.request-submit').on('click', function(event){
		event.preventDefault();

		valid = true;

		// проверка инпутов
		$('.request-input').each(function(){
			if (!$(this).val().length) {
				validationError($(this));
			} else {
				switch ($(this).attr('name')) {
					case 'phone': {
						var val = $(this).val();
						if (val.length < 11 || val.match(/[a-z]/i)) {
							validationError($(this));
							break;
						}
						break;
					}
					case 'email': {
						var exp = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
		    			if (!exp.test($(this).val())) {
							validationError($(this));
							break;
		    			}
					}
				}
			}
		})

		if (valid) $('.request-form').submit();
	})

	$('.request-input').on('focus', function(){
		if ($(this).hasClass('error')) $(this).removeClass('error');
	})

	function validationError($el) {
		valid = false;
		$el.addClass('error');
	}

	// сабмит формы по энтеру при фокусе на инпуте
	$('body').on('keyup', function(event) {
		if (event.keyCode === 13) {
			if ($('.request-input:focus')) $('.request-submit').click();
		}
	})
})

// отслеживает текущий раздел и меняет активный элемент в меню. при ресайзе перерасчитывает объекты
function ScrollMonitor() {
	var $menuItems = $('.navbar-item:has(a[href^=#])');
	var $links = $('[href^=#].navbar-link');
	var hashBlocks = [];

	// прописывает значения в объекты, которые понадобятся для определения позиции
	function calculateHashBlocks() {
		hashBlocks = [];
		$links.each(function(){
			hashBlocks.push({
				hash: this.hash,
				menuItem: $(this).parent(),
				block: $(this.hash),
				height: $(this.hash).height(),
				start: null,
				end: null
			});
		})
		hashBlocks.forEach(function(hashBlock, i){
			var prevHeight = hashBlocks[i-1] ? hashBlocks[i-1].height : 0; 
			var blockOffset = hashBlock.block.offset().top;

			hashBlock.start = blockOffset - prevHeight * 0.5;
			hashBlock.end = blockOffset + hashBlock.height * 0.5;
		})
	}
	
	// определяет в каком разделе находится пользователь и вызывает обработчики
	function definePosition() {
		var scroll = $('body').scrollTop() || $('html').scrollTop();

		hashBlocks.forEach(function(hashBlock, i){
			if (scroll >= hashBlock.start && scroll < hashBlock.end) {

				if (!hashBlock.menuItem.hasClass('active')) {
					update(hashBlock);
				}

				if (!hashBlock.block.find('.show-content').length && hashBlock.block.attr('id') !== 'main') {
					showContent(hashBlock);
				}

				return false;
			}
		})
	}

	// обновляет хэш и элементы меню
	function update(hashBlock) {
		$menuItems.removeClass('active');
		hashBlock.menuItem.addClass('active');
    	history.pushState(null, null, hashBlock.hash);
	}

	// показывает контент, который скрыт при загрузке
	function showContent(hashBlock) {
    	hashBlock.block.children('.onload-hidden').addClass('show-content');
	}


	/* ACTION */

	calculateHashBlocks();

	$(document).on('scroll', function(){
		definePosition();
	})

	$(window).on('resize', function(){
		calculateHashBlocks();
	})
}

// плавный скрол до элемента по хэшу
function pageScroll(hash) {
	var target = $(hash)[0];
	var menuHeight = parseInt($('#menu').css('height'));
	var offset = target.offsetTop - menuHeight;
	
	$('html, body').animate({
		scrollTop: offset
	}, 1000);
}
