var ui = {};

$(document).ready(function() {
  $('#myLayout').w2layout({
    name: 'myLayout',
    panels: [
      { type: 'top', size: 30, resizable: false },
      { type: 'main', size: 400, resizable: true },
      { type: 'right', size: 400, resizable: true },
      { type: 'preview', size: 300, resizable: true }
    ]
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
      active: 'tab_output',
      tabs: [
        { id: 'tab_output', caption: 'Output' },
        { id: 'tab_console', caption: 'Console' }
      ],
      onClick: function (event) {
        if(ui.destroyableComponents.length > 0) {
          for(var i=0;i<ui.destroyableComponents.length;i++) {
            var c = ui.destroyableComponents[i];
            c.destroy();
          }
          ui.destroyableComponents = [];
        }
        if(event.target == 'tab_output') {
          showOutputTab();
        }
        else if (event.target == 'tab_console') {
          showConsoleTab();
        }
      }
    });
    showOutputTab();
  };

  var showOutputTab = function() {
    if(ui.consolelog) {
      console.log = ui.consolelog;
      delete ui.consolelog;
    }
    $('#tab-content').html('<div id="otoolbar"></div><div id="output"></div>');
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
    if(!ui.consolelog) {
      ui.consolelog = console.log;
      console.log = function(out) {
        ui.term.echo(out);
      };
    }
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
    }, {
      greetings: 'Console',
      name: 'consoleTerminal',
      height: 200,
      prompt: '> ' }
    );
  };


  setupEditor();
  setupTabs();
  setupRightPanel();

});