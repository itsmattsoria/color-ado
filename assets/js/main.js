var Main = (function($) {

  var $document,
      palette,
      paletteData,
      $palette,
      apiUrl,
      mode,
      getColor,
      startingCount,
      testing = false;

  function _init() {
    // Cache some common DOM queries
    $document = $(document);
    $('body').addClass('loaded');
    $palette = $('.palette');
    palette = {};
    paletteData= {};
    startingCount = 4;
    mode = 'analogic-complement';

    // Testing
    // testing = true;
    if (testing === true) {
      $('body').addClass('testing');
    }

    // Init functions
    _buildPalette();
    _initActions();

    // Esc handlers
    $(document).keyup(function(e) {
      if (e.keyCode === 27) {

      }
    });

  } // end init()

  // Generate a random color
  function _getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  function _buildPalette() {
    var randomColor = _getRandomColor();
    randomColor = randomColor.replace('#','');
    apiUrl = 'http://www.thecolorapi.com/scheme?hex='+randomColor+'&format=jsonp&mode='+mode+'&count='+startingCount;

    $.get(apiUrl, function() {
    }).done(function(response) {
      var colors = response.colors;

      for (var i=0;i<colors.length;i++) {
        palette['color-'+i] = colors[i].hex.value;
        paletteData['color-'+i] = {'value': colors[i].hex.value, 'name': colors[i].name.value};
      }

      $.each(paletteData, function(index, color) {
        $palette.append('<div class="color" style="background-color:'+color.value+';" data-hex="'+color.value+'" data-name="'+color.name+'" data-palette-index="'+index+'"><div class="-inner"><h3 class="color-name">'+color.name+'</h3><p class="color-hex" contenteditable="true">'+color.value+'</p></div></div>');
      });

      _genorateResults(palette);
    });

    // Watch Color Palette for Changes
    $document.on('input', '.color-hex', function(e) {
      var colorHexValue = $(this).html();

      if (colorHexValue.length === 7) {
        var $thisColor = $(this).closest('.color');
        var paletteIndex = $thisColor.attr('data-palette-index');

        palette[paletteIndex] = colorHexValue;
        $thisColor.css('background-color', colorHexValue);

        _genorateResults(palette);
      }
    }).on('blur', '.color-hex', function(e) {
      var colorHexValue = $(this).html();

      if (colorHexValue.length !== 7) {
        $(this).html($(this).closest('.color').attr('data-hex'));
      }
    });
  }

  function _genorateResults(palette) {

    var comparisonColor = _getRandomColor();
    $(".comparison").css("background-color", comparisonColor);

    var getColor = nearestColor.from(palette);
    var resultColor = getColor(comparisonColor);
    var resultColorName = $('.color[data-palette-index="'+resultColor.name+'"]').attr('data-name');

    $('.result').css("background-color", resultColor.value);
    $('.result h2 .color-name').html(resultColorName + ' ('+resultColor.value+')');
  }

  function _initActions() {
    $('.comparison button').on('click', function() {
      _genorateResults(palette);
    });
  }

  // Track ajax pages in Analytics
  function _trackPage() {
    if (typeof ga !== 'undefined') { ga('send', 'pageview', document.location.href); }
  }

  // Track events in Analytics
  function _trackEvent(category, action) {
    if (typeof ga !== 'undefined') { ga('send', 'event', category, action); }
  }

  // Public functions
  return {
    init: _init
  };

})(jQuery);

// Fire up the mothership
jQuery(document).ready(Main.init);

// Zig-zag the mothership
jQuery(window).resize(Main.resize);
