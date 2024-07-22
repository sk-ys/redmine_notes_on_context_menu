require_dependency File.expand_path('../lib/issue_notes_on_context_menu/hooks.rb', __FILE__)
require_dependency File.expand_path('../lib/issue_notes_on_context_menu/patches/journals_helper_patch.rb', __FILE__)

Redmine::Plugin.register :redmine_issue_notes_on_context_menu do
  name 'Redmine Issue Notes On Context Menu plugin'
  author 'sk-ys'
  description 'This is a plugin for Redmine'
  version '0.1.1'
  url 'https://github.com/sk-ys/redmine_issue_notes_on_context_menu'
  author_url 'https://github.com/sk-ys'
end
