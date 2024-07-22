# Redmine - project management software
# Copyright (C) 2006-2023  Jean-Philippe Lang
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.

class IssueNotesOnContextMenusController < ApplicationController
  unloadable
  before_action :find_journal, only: [:show]
  before_action :find_issue, only: [:new, :create]
  
  helper :journals
  
  def show
    respond_to do |format|
      format.js
    end
  end
  
  def new
    respond_to do |format|
      format.js
    end
  end
  
  def create
    @saved = false
    if update_issue_from_params
      begin
        @saved = save_issue_with_child_records == true
        @journal = @issue.current_journal
      rescue ActiveRecord::StaleObjectError
      end
    end
    
    respond_to do |format|
      format.js
    end
  end
  
  private
  
  def find_journal
    @journal = Journal.visible.find(params[:id])
    @project = @journal.journalized.project
  rescue ActiveRecord::RecordNotFound
    render_404
  end
  
  def find_issue
    @issue = Issue.find(params[:issue_id])
    @project = @issue.project
  rescue ActiveRecord::RecordNotFound
    render_404
  end
  
  # This code is based on redmine/app/controllers/issues_controller.rb
  # Saves @issue and a time_entry from the parameters
  def save_issue_with_child_records
    Issue.transaction do
      time_entry = @time_entry || TimeEntry.new
      call_hook(
        :controller_issues_edit_before_save,
        {:params => params, :issue => @issue,
          :time_entry => time_entry,
          :journal => @issue.current_journal}
      )
      if @issue.save
        call_hook(
          :controller_issues_edit_after_save,
          {:params => params, :issue => @issue,
            :time_entry => time_entry,
            :journal => @issue.current_journal}
        )
        true
      else
        raise ActiveRecord::Rollback
      end
    end
  end
  
  # This code is based on redmine/app/controllers/issues_controller.rb
  # Used by #edit and #update to set some common instance variables
  # from the params
  def update_issue_from_params
    @issue.init_journal(User.current)
    @issue.safe_attributes = replace_none_values_with_blank(params[:issue])
    @priorities = IssuePriority.active
    @allowed_statuses = @issue.new_statuses_allowed_to(User.current)
    true
  end
end
