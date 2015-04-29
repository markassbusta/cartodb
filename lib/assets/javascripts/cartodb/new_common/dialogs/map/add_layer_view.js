var cdb = require('cartodb.js');
var BaseDialog = require('../../views/base_dialog/view');
var CreateListing = require('../create/create_listing');
var FooterView = require('./add_layer/footer_view');
var ViewFactory = require('../../view_factory');
var randomQuote = require('../../view_helpers/random_quote');

/**
 * Add layer dialog, typically used from editor
 */
module.exports = BaseDialog.extend({

  initialize: function() {
    this.elder('initialize');
    if (!this.model) {
      throw new TypeError('model is required');
    }
    if (!this.options.user) {
      throw new TypeError('user is required');
    }

    this._template = cdb.templates.getTemplate('new_common/dialogs/map/add_layer_template');
    this._initBinds();
  },

  // implements cdb.ui.common.Dialog.prototype.render
  render: function() {
    this.clearSubViews();
    BaseDialog.prototype.render.call(this);
    this.$('.content').addClass('Dialog-content--expanded');
    this._initViews();
    this.$('.js-footer').append(this._footerView.render().el);
    return this;
  },

  // implements cdb.ui.common.Dialog.prototype.render
  render_content: function() {
    return this._template({
    });
  },

  _initBinds: function() {
    this.model.bind('addLayerDone', this.hide, this);
    this.model.bind('change:contentPane', this._onChangeContentView, this);
    cdb.god.bind('importByUploadData', this.close, this);
    this.add_related_model(cdb.god);
  },

  _initViews: function() {
    this._contentPane = new cdb.ui.common.TabPane({
      el: this.$('.js-content-container')
    });
    this.addView(this._contentPane);
    this._addTab('listing',
      new CreateListing({
        createModel: this.model,
        user: this.options.user
      })
    );
    this._addTab('creatingFromScratch',
      ViewFactory.createByTemplate('new_common/templates/loading', {
        title: 'Creating empty dataset…',
        quote: randomQuote()
      })
    );
    this._addTab('addingNewLayer',
      ViewFactory.createByTemplate('new_common/templates/loading', {
        title: 'Adding new layer…',
        quote: randomQuote()
      })
    );
    this._addTab('addLayerFailed',
      ViewFactory.createByTemplate('new_common/templates/fail', {
        msg: 'Could not add layer'
      })
    );
    this._contentPane.active(this.model.get('contentPane'));

    this._footerView = new FooterView({
      model: this.model
    });
    this.addView(this._footerView);
  },

  _addTab: function(name, view) {
    this._contentPane.addTab(name, view.render());
    this.addView(view);
  },

  _onChangeContentView: function() {
    var pane = this.model.get('contentPane');
    this._contentPane.active(pane);
    if (pane === 'loading') {
      this._footerView.hide();
    }
  }

});