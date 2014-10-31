var App;

!(function ($) {

  "use strict";

  App = window.APPLICATION = {};

  /**
   * Config
   */
  App.config = {

    environment : (window.location.href.match(/(localhost)/g) ? 'development' : 'production' ),
    
    api : window.location.protocol + '//' + window.location.host + '/admin/api/',

    debug: true
    
  };



  /**
   * Data
   */
  App.data = {

    temp : {},
    audio : {}

  }
  

  /**
   * Elements
   */
  App.$el = {

    wrap    : $('#wrap'),


  };


  /**
   * Init
   */
  App.init = function() {

    // Main
    App.events();
    App.scripts();

    // App.fileReader.init();
    
    App.audioPlayer.init();
  
  
  };


  /**
   * Scripts
   * 
   */
  App.scripts = function() {

    $('pre code').each(function(i, block) {
      hljs.highlightBlock(block);
    });

  }



  /**
   * Events
   * 
   */
  App.events = function() {



  }



  /**
   * Forms
   */
  App.forms = {


  

  }




  App.fileReader = {

    init: function() {

      if ( document.getElementById('file') ) {
        this.setElements();
      }

      this.$el.file_input.addEventListener('change', this.handleFiles, false);

    },

    setElement : function() {

      this.$el = {

        file_input    : document.getElementById('file'),
        selected_file : document.getElementById('file').files[0],

        preview : document.getElementById('preview')

      }

    },

    handleFiles : function() {

      var files = this.files;

      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var imageType = /image.*/;
        
        if (!file.type.match(imageType)) {
          continue;
        }
        
        var img = document.createElement("img");
        img.classList.add("obj");
        img.file = file;

        console.log(img);

        App.fileReader.$el.preview.appendChild(img); // Assuming that "preview" is a the div output where the content will be displayed.
        
        var reader = new FileReader();
        reader.onload = (function(aImg) { return function(e) { aImg.src = e.target.result; }; })(img);
        reader.readAsDataURL(file);
      }

      

    }

  }



  /* 
    (total yards + ptsScored*10 + turnoverRatio*40)/numOffensivePlays - 
        (total yards allowed + ptsAllowed*10)/numDefensivePlays
   */


  /**
   * Audio Player
   */
  App.audioPlayer = {

    /**
     * Options
     */
    options : {

      increment : {
        forward : 10,
        rewind  : -10
      },

      invert_duration : false

    },


    /**
     * Defaults
     */
    defaults : {
      loop      : false,
      autoplay  : false,
      preload   : true,
      controls  : false
    },


    /**
     * Elements
     */
    $el : {

      audio : $('#audio'),

      player : $('#player'),

      actions : {
        play : $('#player-action--play'),
        rewind : $('#player-action--rewind'),
        fast_forward : $('#player-action--fast_forward'),
        
        volume_toggle : $('#player-action--volume_toggle'),
        volume : $('#player-action--volume'),
      },

      info : {
        current_time : $('#player-info--current_time'),
        duration : $('#player-info--duration')
      },

      timeline : $('#player-timeline'),
      progress : $('#player-timeline--progress'),


      output :{
        debug : $('#output--debug')
      }

    },


    /**
     * Init
     */
    init : function() {

      var _this = App.audioPlayer;

      /**
       * Audio Ready
       * Recursive loop to wait for ready state
       */
      var audioReady = function(){

        var _this = App.audioPlayer;

        if ( _this.$el.audio[0].readyState && _this.$el.audio[0].readyState == 4 ) {

          if ( App.config.debug ) { 
            _this.$el.output.debug.prepend('<br>Audio is ready');
          }
          

          // Event Listeners
          _this.events();
          
          // Render Duration
          _this.info.renderDuration();


          /**
           * Set Defaults
           */
          for (var key in _this.defaults) {
            _this.$el.audio[0][key] = _this.defaults[key];
          }


          console.log(_this.volume.getCurrentVolume(), _this.volume.getNewVolume())


        } else {
          setTimeout(audioReady, 150);
        }
      }
      audioReady();


    },



    /**
     * Play
     */
    play : function() {

      var audio = this.$el.audio[0],
          player = this.$el.player;

      if ( audio.paused ) {
        // Play
        audio.play()
        player.removeClass('player-state--pause').addClass('player-state--play')

        if ( App.config.debug ) { 
          this.$el.output.debug.prepend('<br>App.audioPlayer.play()')
        }
      } else {
        // Pause
        audio.pause()
        player.removeClass('player-state--play').addClass('player-state--pause')

        if ( App.config.debug ) { 
          this.$el.output.debug.prepend('<br>App.audioPlayer.play() -- else block')
        }
      }

    },

    /**
     * Track Progress
     */
    timeline : {


      /**
       * Update Timline
       * @param {DOMElement} progress 
       */
      updateTimeline : function() {

        var _this = App.audioPlayer;

        var play_percent = 100 * ( _this.$el.audio[0].currentTime / _this.$el.audio[0].duration );
            
        _this.$el.progress.width(play_percent + '%');

      },


      /**
       * Change Curren Time
       * Used to Fast-Forward or Reverse
       */
      changeCurrentTime : function(increment) {

        var _this = App.audioPlayer;

        _this.$el.audio[0].currentTime = _this.$el.audio[0].currentTime + increment
      },




      /**
       * Move Playhead
       * 
       */
      movePlayhead : function(percent) {

        var _this = App.audioPlayer;

        _this.$el.progress.width(percent+'%');
      }

       
   
    },

    /**
     * Info (Live Updates)
     */
    info : {

      /**
       * Render Duration
       * Render the duration of the track
       */
      renderDuration : function() {

        var _this = App.audioPlayer,
            duration__formatted;

        if ( _this.options.invert_duration ) {
          // @TODO implement time left
        } else {
          duration__formatted = _this.$el.audio[0].duration.toString().toHHMMSS();
        }

        _this.$el.info.duration.html(duration__formatted);
      },

      /**
       * Render Current Time
       * Render the current time of the track
       */
      renderCurrentTime : function() {

        var _this = App.audioPlayer;

        // var current_time__formatted = _this.$el.audio[0].currentTime.toFixed(2);
        var current_time__formatted = _this.$el.audio[0].currentTime.toString().toHHMMSS();

        _this.$el.info.current_time.html(current_time__formatted);
      },


      /**
       * Click Percent
       * Get percent (offset from left) on click of timeline
       */
      clickPercent : function(event) {
        
        var _this = App.audioPlayer;

        var offset = ( ( event.pageX - _this.$el.timeline[0].offsetLeft ) / _this.$el.timeline.width() ) 

        if ( App.config.debug ) { 
          _this.$el.output.debug.prepend('<br> &nbsp; event.pageX -> ', offset);
          _this.$el.output.debug.prepend('<br> &nbsp; timeline.width() -> ',  _this.$el.timeline.width());
          _this.$el.output.debug.prepend('<br>App.audioPlayer.clickEvent()');
        }
        return offset;
      }

    },



    /**
     * Volume
     * Volume controls (input[range])
     */
    volume : {

      getCurrentVolume: function() {
        var _this = App.audioPlayer;

        return _this.$el.audio[0].volume;
      },

      getNewVolume: function() {
        var _this = App.audioPlayer;

        return parseFloat(_this.$el.actions.volume.val()) / 100;
      },

      setVolume: function(value) {
        var _this = App.audioPlayer;

        _this.$el.audio[0].volume = value;

        if ( App.config.debug ) { 
          _this.$el.output.debug.prepend('<br> &nbsp; value -> ', value);
          _this.$el.output.debug.prepend('<br>App.audioPlayer.volume.setVolume()');
        }
      }

    },








    /**
     * Events
     */
    events : function() {

      var _this        = this,
          audio        = this.$el.audio[0],
          timeline     = this.$el.timeline[0],
          progress     = this.$el.progress,
          current_time = this.$el.audio[0].currentTime,
          duration     = this.$el.audio[0].duration;


      /** 
       * Set the audio duration
       */
      audio.addEventListener('canplaythrough', function () {
        duration = audio.duration;
      }, false);


      /** 
       * Play/Pause
       */
      this.$el.actions.play.click( function (event) {
        event.preventDefault();
        _this.play();
      });

      /** 
       * Rewind
       */
      this.$el.actions.rewind.click( function (event) {
        _this.timeline.changeCurrentTime(_this.options.increment.rewind);
      });


      /** 
       * Fast Forward
       */
      this.$el.actions.fast_forward.click( function (event) {
        _this.timeline.changeCurrentTime(_this.options.increment.forward);
      });


      /** 
       * Set Volume
       */
      this.$el.actions.volume.change( function (event) {
        
        var new_volume = _this.volume.getNewVolume();

        _this.volume.setVolume(new_volume);

      });


      /** 
       * Makes timeline clickable
       */
      timeline.addEventListener("click", function (event) {

        var percent = _this.info.clickPercent(event);

        _this.timeline.movePlayhead(percent * 100);

        if ( App.config.debug ) { 
          _this.$el.output.debug.prepend('<br> &nbsp; percent -> ', percent * 100);
          _this.$el.output.debug.prepend('<br>App.audioPlayer.movePlayhead()');
        }

        audio.currentTime = duration * percent;
        

      }, false);


      /** 
       * Time Update Events
       */
      audio.addEventListener('timeupdate', function (event) {

        // Update the timeline
        _this.timeline.updateTimeline();
        
        // Update the current time display
        _this.info.renderCurrentTime();

      }, false);



      /**
       * Keyboard Bindings
       */
      document.addEventListener('keydown', function (event) {

        // Spacebar (Play)
        if ( event.keyCode == 32 ) {
          _this.play();
        }

        // Left (Rewind)
        if ( event.keyCode == 37 ) {
          _this.timeline.changeCurrentTime(_this.options.increment.rewind)
        }
        // Right (Fast-Forward)
        if ( event.keyCode == 39 ) {
          _this.timeline.changeCurrentTime(_this.options.increment.forward)
        }
      })

    }
  }







  /**
   * DOM Ready
   */
  $(document).ready(function() {

    App.init();

  })




  String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time    = hours+':'+minutes+':'+seconds;
    return time;
  }


  /**
   * Observe session data object and live-update in localStorage
   */
  Object.observe(App.data.audio, function (changes){

      changes.forEach(function (change) {

          // App.storage.set('data', change.object)
      });

  });


})(jQuery);