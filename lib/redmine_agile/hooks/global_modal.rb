module RedmineIssueModal
  class Hooks < Redmine::Hook::ViewListener
    def view_layouts_base_html_head(context = {})
      tags = <<-HTML
        <script src="/javascripts/jstoolbar/jstoolbar.js"></script>
        <script src="/javascripts/jstoolbar/common_mark.js"></script>
        <script src="/javascripts/jstoolbar/textile.js"></script>
        <script src="/javascripts/jstoolbar/lang/jstoolbar-en.js"></script>
        <script src="/javascripts/tribute-5.1.3.min.js"></script>
        <script src="/javascripts/context_menu.js"></script>
        <script src="/javascripts/attachments.js"></script>
      HTML
      tags.html_safe
    end

    # Chèn modal vào cuối <body>
    def view_layouts_base_body_bottom(context = {})
      modal_html = <<-HTML
        <div id="global-modal" class="global-modal" style="display: none;">
          <div class="global-modal__content">
            <div class="content__header">
              <h2 class="header__title">Edit Issue</h2>
              <div class="header__close-btn">&times;</div>
            </div>
            <div id="glocal-modal-content-body" class="content__body">
              <p>Loading content...</p>
            </div>
          </div>
        </div>
    
        <script src="/plugin_assets/redmine_agile/javascripts/modal.js"></script>
        <link rel="stylesheet" href="/plugin_assets/redmine_agile/stylesheets/modal.css" />
      HTML
      modal_html.html_safe
    end
  end
end
