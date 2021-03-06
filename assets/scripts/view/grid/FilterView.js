define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/form/Form',
  'view/ModelView',
  'view/form/fields/FilterField',
  'view/form/fields/SearchField',
  'view/menu/DropdownMenu',
  'util/ModelUtil',
  'text!view/grid/templates/FilterView.html'
], function($, _, Backbone, Handlebars, Plumage, Form, ModelView, FilterField, SearchField,
    DropdownMenu, ModelUtil, template) {

  /**
   * Contains special fields defined declaratively that collectively affect a collection's filter meta attribute.
   *
   * Currently each field must be customized to update the filter in updateModel. Maybe this aspect could me
   * moved down into FilterView.
   */
  return Plumage.view.grid.FilterView = Form.extend({

    className: 'form-inline filter-view',

    template: Handlebars.compile(template),

    showSearch: true,

    searchEmptyText: 'Search',

    filterConfigs: [],

    defaultFieldCls: FilterField,

    moreMenuItems: [{value: 'download', label: 'Download', icon: 'arrow-down'}],

    initialize: function(options) {
      var me = this;

      Form.prototype.initialize.apply(this, arguments);
      options = options || {};

      this.filterFields = [];
      this.subViews = _.clone(this.subViews);

      _.each(this.filterConfigs, function(config){
        var filterConfig = _.extend({}, {
          selector: '.filters',
          className: 'filter-field',
          relationship: this.relationship
        }, config);
        var fieldCls = config.fieldCls || this.defaultFieldCls;
        var filter = new fieldCls(filterConfig);
        this.subViews.push(filter);
        this.filterFields.push(filter);
      }, this);

      if (this.showSearch) {
        this.searchField = new SearchField({
          selector: '.search',
          noSelectionText: this.searchEmptyText,
          modelAttr: 'query'
        });
        this.subViews.push(this.searchField);
      }

      this.subViews.push(this.moreMenu = new DropdownMenu({
        selector: '.more-menu',
        buttonStyle: true,
        iconCls: 'icon-cog',
        label: '',
        menuItems: this.moreMenuItems,
        opens: 'left',
        replaceEl: true
      }));

      this.subViews.concat(options.subViews || []);

      _.each(this.filterFields, function(filterField){
        if (filterField.listModelCls) {
          var ListModelCls = ModelUtil.loadClass(filterField.listModelCls);
          var listModelParams = filterField.listModelParams || {};
          var model = this.createFilterListModel(ListModelCls, listModelParams);
          filterField.setListModel(model);
        }
      }, this);
    },

    getTemplateData: function() {
      var data = Form.prototype.getTemplateData.apply(this, arguments);
      data.hasFilters = this.filterConfigs.length > 0;
      return data;
    },

    createFilterListModel: function(listModelCls, listModelParams) {
      return new listModelCls(null, listModelParams);
    },

    onRender: function() {
      $(this.el).html(this.template({
        searchQuery: ''
      }));
    },

    update: function(isLoad) {
      //don't rerender nothing
    },

    setModel: function() {
      Plumage.view.ModelView.prototype.setModel.apply(this, arguments);
    },
  });
});
