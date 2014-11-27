var ui = {};

$(document).ready(function() {
  $('#myLayout').w2layout({
    name: 'myLayout',
    panels: [
      { type: 'top', size: 30, resizable: false },
      { type: 'main', size: 400, resizable: true },
      { type: 'right', size: 400, resizable: true },
      { type: 'preview', size: 300, resizable: true }
    ],
      onResize: function(event) {
       $('#output').height( $('#tab-content').height()-$('#otoolbar').height()-10);
      }
  });
  w2ui['myLayout'].content('main', $('#mainContent').html());
  $('#mainContent').html('');

  w2ui['myLayout'].content('right', $('#rightContent').html());
  $('#rightContent').html('');

  w2ui['myLayout'].content('top', $('#topContent').html());
  $('#topContent').html('');

  w2ui['myLayout'].content('preview', $('#previewContent').html());
  $('#previewContent').html('');

  // setup top toolbar
  $('#toolbar').w2toolbar({
    name: 'toolbar',
    items: [
      { type: 'menu',   id: 'item2', caption: 'Bot', img: 'icon-folder', items: [
        { text: 'Item 1', icon: 'icon-page' }, 
        { text: 'Item 2', icon: 'icon-page' }, 
        { text: 'Item 3', value: 'Item Three', icon: 'icon-page' }
      ]},
      { type: 'break', id: 'break1' },
      { type: 'radio',  id: 'item3',  group: '1', caption: 'Source', icon: 'fa fa-file-code-o', checked: true },
      { type: 'radio',  id: 'item4',  group: '1', caption: 'Chart', icon: 'fa fa-line-chart' },
      { type: 'break', id: 'break2' },
      { type: 'radio',  id: 'item5',  group: '1', caption: 'Run Bot', icon: 'fa fa-play'},
      { type: 'radio',  id: 'item6',  group: '1', caption: 'Stop Bot', icon: 'fa fa-stop'},
      { type: 'break', id: 'break2' },
      { type: 'button',  id: 'item7',  caption: 'Save', icon: 'fa fa-save' },
      { type: 'button',  id: 'item8',  caption: 'Reset', icon: 'fa fa-undo' },
      { type: 'break', id: 'break3' },
      { type: 'button',  id: 'item9',  caption: 'Configure Server', icon: 'fa fa-note' },
      { type: 'button',  id: 'item9',  caption: 'Restart Server', icon: 'fa fa-eraser' }
    ]
  });


  var setupEditor = function() {
    // setup main editor window
    ui.editor = ace.edit("editor");
    ui.editor.setTheme("ace/theme/monokai");
    ui.editor.getSession().setMode("ace/mode/javascript");
  };

  ui.destroyableComponents = [];
  var setupTabs = function() {
    // setup tabs
    $('#tabs').w2tabs({
      name: 'tabs',
      active: 'tab_console',
      tabs: [
        { id: 'tab_output', caption: 'Output' },
        { id: 'tab_console', caption: 'Console' },
        { id: 'tab_advice', caption: 'Advice' },
        { id: 'tab_simulator', caption: 'Simulator' },
        { id: 'tab_trades', caption: 'Live Trader' }
      ],
      onClick: function (event) {
        switch(event.target) {
          case 'tab_output':
            showOutputTab();
            break;
          case 'tab_console':
            showConsoleTab();
            break;
          case 'tab_advice':
            showAdviceTab();
            break;
          case 'tab_simulator':
            showSimulatorTab();
          case 'tab_trades':
            showTradesTab();
            break;
          default:
            break;
        }
      },
      onClose: function (event) {
        if(ui.destroyableComponents.length > 0) {
          for(var i=0;i<ui.destroyableComponents.length;i++) {
            var c = ui.destroyableComponents[i];
            c.destroy();
          }
          ui.destroyableComponents = [];
        }
        if(event.target === 'tab_console')  {
          if(ui.consolelog) {
            console.log = ui.consolelog;
            delete ui.consolelog;
            delete ui.output;
          }
        }
      }
    });
  };

  var setOutputLog = function(term) {
    if(!ui.consolelog) {
      ui.consolelog = console.log;
      console.log = function(out) {
        if(ui.output) {
          ui.output.setValue(ui.output.getValue() + "\n" + out);
          ui.output.alignCursors();
          ui.output.clearSelection();
        }
        else if(ui.consolelog) ui.consolelog(out);
      };
    }
  };

  var showOutputTab = function() {
    $('#tab-content').html('<div><div id="otoolbar"></div><div id="output"></div></div>');
    // setup output  editor window
    ui.output = ace.edit("output");
    ui.output.setTheme("ace/theme/xcode");
    ui.output.setReadOnly(true);
    // setup output toolbar
    $('#otoolbar').w2toolbar({
      name: 'output',
      items: [
        { type: 'button',  id: 'otoolClear',  caption: 'Clear', icon: 'fa fa-cut' },
        { type: 'button',  id: 'otoolCopy',  caption: 'Copy', icon: 'fa fa-copy' }
      ]
    });
    ui.destroyableComponents.push(w2ui.output);
    setOutputLog(ui.output);
    //$('#output').height( $('#tab-content').height()-$('#otoolbar').height()-10);
  };

  var setupRightPanel  = function() {
    $('#propertyGrid').w2grid({
      name: 'properties',
      header: 'Bot Properties',
      show: {
        toolbar: true,
        footer: true
      },
      columns: [
        { field: 'propname', caption: 'Property', size: '200px', sortable: true, resizable: true },
        { field: 'propval', caption: 'Value', size: '100%', sortable: true, resizable: true, editable: { type: 'text' } }
      ],
      searches: [
        { field: 'propname', caption: 'Property', type: 'text' },
        { field: 'propval', caption: 'Value', type: 'text' }
      ],
      sortData: [{ field: 'propname', direction: 'ASC' }],
      records: [
        { recid: 1, propname: 'BotName', propval: 'test' }
      ]
    });
  };


  var showConsoleTab = function() {
    $('#tab-content').html('<div id="console"></div>');
    $('#console').terminal(function(command, term) {
      ui.term = term;
      if (command !== '') {
        try {
          var result = window.eval(command);
          if (result !== undefined) {
            ui.term.echo(new String(result));
          }
        } catch(e) {
          ui.term.error(new String(e));
        }
      } else {
        ui.term.echo('');
      }
    },
    {
      greetings: 'BitBot v0.1',
      name: 'consoleTerminal',
      height: 200,
      prompt: '$ ',
      outputLimit: 500
    });
  };

  var showAdviceTab = function() {
    var adviceGrid = {
        name: 'advice',
        header: 'Advice',
        show: {
        header: true,
        footer: true
      },
        style: 'padding: 0px',
        columns: [
        { field: 'recid', caption: "id", size: '100px' },
        { field: 'title', caption: "text", size: '100%' }
      ]
    };
  };

  var showTradesTab = function() {

  };

  var showSimulatorTab = function() {

  };

  var setupSocketClient = function() {
    var socket = io();
    var error = function(o) { return console.log('error: received invalid message from server:' + JSON.stringify(o, null, 4)); };
    socket.on('__data', function(msg) {
      if(!(msg.message && msg.data) )
        return error(msg);
      switch(msg.message) {
        case 'welcome':
          console.log('connected to socket server. ' + msg.message);
          break;
        case 'advice':
          console.log('received new trading advice:' + JSON.stringify(msg.data, null, 4));
          break;
        case 'candle':
          console.log('received new candle:' + JSON.stringify(msg.data, null, 4));
          break;
        case 'trade':
          console.log('received new trade:' + JSON.stringify(msg.data, null, 4));
          break;
        default:
          return;
      }
    });
  };

  setupEditor();
  setupTabs();
  setupRightPanel();
  setupSocketClient();
  showOutputTab();


});