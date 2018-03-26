var badnames=0;
jQuery.ajaxSetup({cache:false});

function getURLParameter(name) {
    return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );
}

$('#btnGetTrees').click(function(event) {
    
  $("#loading").toggle(true);
  $("#status").toggle(false);

  if (!validateForm()) {
    $("#status").html('<div class="alert alert-danger"><h4>Missing information</h4><p>Please fill in all the fields.</p></div>');
    
    $("#loading").toggle(false);
    $("#status").toggle(true);
    
    return false;
  }

  var url =  'https://tree-pruner-dot-map-of-life.appspot.com/api/prune';
  if (getURLParameter('debug') == 'true') {
    url =  'https://tree-pruner-alpha-dot-map-of-life.appspot.com/api/prune';
  }
  url =  'https://tree-pruner-alpha-dot-map-of-life.appspot.com/api/prune';

  $.post(url, {
    email: $('#email').val(),
    tree_base: $("input[name=grpTaxa]:checked").val(),
    tree_set: $('#treeset').val(),
    sample_size: $('#treenum').val(),
    species: $('#selected').val()
  }).done(function (data) {
    $("#status").html('<div class="alert alert-success"><h4>Your request has been submitted</h4> <p>Please note your job id for reference: <strong>' + data.job_id + '</strong>. <br /> We will email you with the final results.</p></div>');
    // window.setTimeout(function() {
    //   $('#emailStatus').val($('#email').val()); 
    //   $('#jobid').val(data.job_id);
    //   checkJobStatus($('#email').val(), data.job_id, $("#status"));
    // }, 60000);
  }).fail(function (response) {
    var errmsg = ""
    if (response && response.responseJSON) {
      errmsg = response.responseJSON.message;
    }
    $("#status").html('<div class="alert alert-danger"><h4>There is an issue with your request</h4><p>' + errmsg + '</p></div>');
  }).always(function () {
    $("#loading").toggle(false);
    $("#status").toggle(true);
  });
});

$('#btnStatus').click(function(event) {
  $("#loadingCheck").toggle(true);
  $("#statusCheck").toggle(false);
  checkJobStatus($('#emailStatus').val(), $('#jobid').val(), $("#statusCheck"));
});

function checkJobStatus(email, job_id, statusObj) {
  var url = 'http://tree-pruner.map-of-life.appspot.com/api/result';
  if (getURLParameter('debug') == 'true') {
    url = 'http://tree-pruner-alpha.map-of-life.appspot.com/api/result';
  }
  $.getJSON(url, {email: email, job_id: job_id})
    .done(function(data) {
      if (data.status == 'error') {
        statusObj.html('<div class="alert alert-danger"><h4>There is an issue with your request</h4><p>' + data.message + '.</p></div>');
      } else if (data.status == 'completed') {
        statusObj.html('<div class="alert alert-success"><h4>Your request has been processed</h4><p>You can download your generated samples <a href="' + data.message + '" class="alert-link">here</a>.</p></div>');
      } else {
        statusObj.html('<div class="alert alert-info"><h4>Hold your horses</h4><p>' + data.message + '.</p></div>');
        // window.setTimeout(function() {
        //   checkJobStatus(email, job_id, statusObj);
        // }, 60000);
      }
    })
    .fail(function(response) {
      $("#statusCheck").html('<div class="alert alert-danger"><h4>There is an issue with your request</h4><p>Please try again or contact us if the problem persists.</p></div>');
    })
    .always(function() {
      $("#loadingCheck").toggle(false);
      $("#statusCheck").toggle(true);
    });
}

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function validateForm() {
  var isValid = true;

  var elemIds = ['#email', '#selected'];

  $.each(elemIds, function (idx, elemId) {
    var el = $(elemId);
    var elP = el.closest('div[class^="form-group"]');
    if (el.val().trim() === '') {
      elP.addClass("has-error");
      isValid = false;
    } else {
      elP.removeClass("has-error");
    }
  });

  return isValid;
}

var treeData = undefined;
function loadTreeData() {
  $.getJSON('/js/treedata.json', function(data) {
    treeData = data;
    loadSelectedTree();
  });
}

function loadSelectedTree() {
  var baseTree = $("input[name=grpTaxa]:checked").val();
  
  $('.speciesContainer').html(treeData[baseTree].names.join("<br />"));
  $('#selected').val('')
  $('#baseTreeName').html(treeData[baseTree].group.toLowerCase());
  
  $("#treeset").empty(); // remove old options
  $.each(treeData[baseTree].treesets, function(key, value) {
    $("#treeset").append($("<option></option>").attr("value", key).text(value));
  });
}

$('input[name=grpTaxa]').on('click', loadSelectedTree);

$('#treenum').blur(
  function(event) {
    if(isNumber(this.value)) {
      if(this.value<100) {
        this.value=100;
      } else if (this.value>10000) {
        this.value=10000;
      }
    } else {
      this.value=10;
    }
  }
);

loadTreeData();
