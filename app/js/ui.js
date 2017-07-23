//------------Input Button Stuff----------------------//

document.getElementById('upload_link').onclick = function() {
  document.getElementById('input_csv').click();
};

/*
 * Code to run when document is ready
 */
$(document).ready(function() {
  // the "href" attribute of the modal trigger must specify the modal ID that wantsupload_link_topo to be triggered
  $('.modal').modal();

  $('.modal').modal({
    dismissible: true, // Modal can be dismissed by clicking outside of the modal
    opacity: .5, // Opacity of modal background
    inDuration: 300, // Transition in duration
    outDuration: 200, // Transition out duration
    startingTop: '4%', // Starting top style attribute
    endingTop: '10%', // Ending top style attribute
    ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
      //alert("Ready test 1 2");
    },
    complete: function() {
      //alert('Closed test test');
    } // Callback for Modal close
  });

  $(".dropdown-button").dropdown();
});

//
function download_png(){
   var svg = d3.select('svg');
   saveSvgAsPng(d3.select('svg').node(), 'cartogram.png');
}

// 
$('#download_svg').click(function(){
    var a      = document.createElement('a');
		a.href     = 'data:image/svg+xml;utf8,' + unescape($('#map')[0].outerHTML);
		a.download = 'svg_info.svg';
		a.target   = '_blank';
		document.body.appendChild(a); a.click(); document.body.removeChild(a);
	});

// Opens a the system's email app so you can post images or your session ID for sharing
function share_email(){
    svgAsDataUri(d3.select('svg').node(), {}, function(uri) {
    //   console.log('uri', uri);     
    //   var pic = d3.select('svg');
        var pic = d3.select('svg');
       window.open('mailto:abc@abc.com?subject=Check out my cartogram!&body='+pic);
      // window.location.href = "mailto:mail@example.org?subject=Mail request&body="+body;
    });
}

// Opens a twitter link where you can post images or your session ID for sharing
function share_twitter(){
    window.open(href="https://twitter.com/intent/tweet?text=Check out my cartogram!", '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600');
}

// writes the user's current CSV to the server
function saveSession(){
  saveCurrentUserCSV(CSV);
}

/*
// loads the user's last-used CSV from the server
function loadMySession(){
  csvFlag = true; //set csvFlag to true
  intit();
}

// loads another user's last-used CSV from the server
function loadOtherSession(){
  csvFlag = false;
  init();
}
*/

// loads the session ID into sharing form
function shareSessionID(element){
  if(userSessionID!=null) element.value = userSessionID;
}

// gets session ID from user...might eventually use that ID to do load another 
// user's CSV file and settings
document.getElementById('paste_session_id').onkeydown = function(event) {
  var e = event || windows.event;
  if (e.keyCode==13){
    tempSessionID = document.getElementById('paste_session_id').value; // gets the session_id from the form for accessing other user's CSV's
  }
}
  
      