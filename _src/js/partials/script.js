$(document).ready(function(event){

	/* Скрол */

	// плавный скрол к якорю после загрузки страницы
	setTimeout(function(){
		$('html, body').scrollTop(0);
		if (location.hash && location.hash !== '#main') setTimeout(function(){
			pageScroll(location.hash)
		}, 300);
	}, 1)
	
	// плавный скрол к якорю по клику
	$('a[href^=#]').on('click', function(event){
		event.preventDefault();
		pageScroll(this.hash);
	})

	// объект мониторит положение страницы и меняет активный пункт меню и хэш
	var scrollMonitor = new ScrollMonitor();

	/* Валидация */

	// объект обслуживает форму
	var validator = new Validator();
	
})


/* Служебные классы и функции */

// плавный скрол до элемента по хэшу
function pageScroll(hash) {
	var target = $(hash)[0];
	var menuHeight = parseInt($('#menu').css('height'));
	var offset = target.offsetTop - menuHeight;

	$('html, body').animate({
		scrollTop: offset
	}, 1000);
}

// отслеживает текущий раздел и меняет активный элемент в меню
// при ресайзе перерасчитывает объекты
function ScrollMonitor() {
	var $menuItems = $('.navbar-item:has(a[href^=#])');
	var $links = $('[href^=#].navbar-link');
	var hashBlocks = [];

	// замена метода для старых браузеров
	if (!history.pushState) update = function(hashBlock) {
		$menuItems.removeClass('active');
		hashBlock.menuItem.addClass('active');
	}

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
		var menuHeight = parseInt($('#menu').css('height'));
		hashBlocks.forEach(function(hashBlock, i){
			var prevHeight = hashBlocks[i-1] ? hashBlocks[i-1].height : 0; 
			var blockOffset = hashBlock.block.offset().top;

			hashBlock.start = blockOffset - prevHeight * 0.5 - menuHeight;
			hashBlock.end = blockOffset + hashBlock.height * 0.5 - menuHeight;
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


function Validator() {
	var valid;

	function formValidation() {
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
						}
						break;
					}
					case 'email': {
						var exp = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
		    			if (!exp.test($(this).val())) {
							validationError($(this));
		    			}
						break;
					}
				}
			}
		})

		if (valid) formSubmit();
	}

	function formSubmit() {
		// отправить данные на сервер
		$.ajax({
	        url: "https://easylead.ru/easyAdmin/service/deliverinbox/post_lead.php",
	        type: "POST",
	        data: {
	                name: $('input[name=name]').val(),
	                name: $('input[name=surname]').val(),
	                company: $('input[name=company]').val(),
	                phone: $('input[name=phone]').val(),
	                email: $('input[name=email]').val()
	        },
	        dataType: "JSON",
	        error: function() {
	        	console.error('Ошибка при отправке данных на сервер');
	        }
		});

		// показать попап
		$('.thanks-overlay').fadeIn(300);

		// очистить форму
		$('.request-form')[0].reset();
		$('.request-input:focus').blur();
	}

	function validationError($el) {
		valid = false;
		$el.addClass('error');
	}

	$('.request-submit').on('click', function(event){
		event.preventDefault();
		formValidation();
	})

	// убрать класс ошибкки при фокусе на инпуте
	$('.request-input').on('focus', function(){
		if ($(this).hasClass('error')) $(this).removeClass('error');
	})

	// закрыть попап
	$('.thanks-overlay').on('click', function(event){
		if ($(event.target).hasClass('thanks-overlay') || $(event.target).hasClass('thanks-close')) 
			$(this).fadeOut(300);
	})

	// обработка ввода с клавиатуры
	$('body').on('keyup', function(event) {
		// сабмит по энтеру
		if (event.keyCode === 13) {
			if ($('.request-input:focus').length)  {
				$('.request-submit').click();
			}
		}
		// закрыть попап по эскейпу
		if (event.keyCode === 27) {
			if ($('.thanks-overlay:visible').length) {
				$('.thanks-overlay').fadeOut(300);
			}

		}
	})
}