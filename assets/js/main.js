var Main = (function($) {

  var $document,
      palette,
      paletteData,
      $palette,
      apiUrl,
      mode,
      getColor,
      paletteCount,
      testing = false;

  function _init() {
    // Cache some common DOM queries
    $document = $(document);
    $('body').addClass('loaded');
    $palette = $('.palette');
    palette = {};
    paletteData= {};
    paletteCount = 4;
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
      // Escape
      if (e.keyCode === 27) {

      }

      // Add
      if (e.keyCode === 187) {
        _paletteAddColor();
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
    apiUrl = 'http://www.thecolorapi.com/scheme?hex='+randomColor+'&format=jsonp&mode='+mode+'&count='+paletteCount;

    $.get(apiUrl).done(function(response) {
      var colors = response.colors;

      for (var i=0;i<colors.length;i++) {
        palette['color-'+i] = colors[i].hex.value;
        paletteData['color-'+i] = {'value': colors[i].hex.value, 'name': colors[i].name.value};
      }

      $.each(paletteData, function(index, color) {
        $palette.append('<div class="color" style="background-color:'+color.value+';" data-hex="'+color.value+'" data-name="'+color.name+'"><div class="-inner"><h3 class="color-hex" contenteditable="true">'+color.value+'</h3><div class="palette-actions"><button class="add">+</button><button class="remove">-</button></div></div></div>');
      });

      _generateResults(palette);
    });

    // Watch Color Palette for Changes
    $document.on('input', '.color-hex', function(e) {
      var colorHexValue = $(this).html();

      if (colorHexValue.length === 7) {
        var $thisColor = $(this).closest('.color');

        $thisColor.css('background-color', colorHexValue);
        $thisColor.attr('data-hex', colorHexValue);

        // Get New Color Name
        var colorApiUrl = 'http://www.colr.org/json/color/'+colorHexValue.replace('#','');
        // $.get(colorApiUrl).done(function(response) {
        //   var responseObject = $.parseJSON(response);
        // });

        _updatePalette();
      }
    }).on('blur', '.color-hex', function(e) {
      var colorHexValue = $(this).html();

      if (colorHexValue.length !== 7) {
        $(this).html($(this).closest('.color').attr('data-hex'));
      }
    });
  }

  function _generateResults(palette) {

    var comparisonColor = _getRandomColor();
    $(".comparison").css("background-color", comparisonColor);
    $('.comparison .color-value').html(comparisonColor);

    var getColor = nearestColor.from(palette);
    var resultColor = getColor(comparisonColor);
    // var resultColorName = $('.color[data-hex="'+resultColor.value+'"]').attr('data-name');

    $('.result').css("background-color", resultColor.value);
    $('.result h2 .color-value').html(resultColor.value);
  }

  function _updatePalette() {
    palette = {};
    colors = $('.palette .color');

    colors.each(function(index, element) {
      var colorValue = $(element).attr('data-hex');
      palette['color-'+index] = colorValue;
    });
  }

  function _initActions() {
    $('.comparison button').on('click', function() {
      _generateResults(palette);
    });

    // Add new color to palette
    $document.on('click', '.palette-actions button', function() {
      var colors = $('.palette .color');
      var $thisColor = $(this).closest('.color');

      if ($(this).is('.add')) {

        _paletteAddColor($thisColor);
        
      } else if ($(this).is('.remove')) {
        if (colors.length === 2) {
          $('.palette-actions .remove').addClass('hidden');
        }

        $thisColor.remove();
      }

      _updatePalette();
    });
  }

  function _paletteAddColor(element) {
    var colors = $('.palette .color');
    var $element;

    if (element === undefined || element === 'undefined') {
      $element = $('.palette .color').last();
    } else {
      $element = element;
    }

    if (colors.length === 1) {
      $('.palette-actions .remove.hidden').removeClass('hidden');
    }

    var newColor = '<div class="color" style="background-color:#FFFFFF;" data-hex="#FFFFFF" data-name="White"><div class="-inner"><h3 class="color-hex" contenteditable="true">#FFFFFF</h3><div class="palette-actions"><button class="add">+</button><button class="remove">-</button></div></div></div>';
    
    $(newColor).insertAfter($element);
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
