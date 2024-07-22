/**
 * Update wiki dialog
 * @param {Element} wikiOuter - Target element
 */
function updateIssueNotesOnContextMenuDialog(wikiOuter) {
  const homePath = $("#top-menu a.home").attr("href");
  const $wikiOuter = $(wikiOuter);
  const $wiki = $wikiOuter.children(".wiki");
  const journalIdCurrent = $wiki.data("journalId");
  const journalIds = $wiki.data("journalIds");
  const editable = $wiki.data("editable");
  const labelContextMenu = $wiki.data("labelContextMenu");

  function updateDialogClass() {
    const $dialogInstance = $wikiOuter.dialog("instance");
    if ($dialogInstance) {
      const $dialog = $dialogInstance.uiDialog;
      $dialog.toggleClass("editable", editable);

      if ($dialogInstance.element.find("form.add_notes_form").length > 0) {
        $dialog.addClass("add_note");
      } else if ($dialogInstance.element.find("form[id^=journal]").length > 0) {
        updateIssueNotesOnContextMenuDialog.bindEventsToEditFormButtons(
          $dialog
        );
      }
    }
  }

  function updateWikiId() {
    $wiki.attr("id", `journal-${journalIdCurrent}-notes`);
  }

  function updateDialogTitle() {
    const $dialogInstance = $wikiOuter.dialog("instance");
    // Countermeasure if dialog is already closed
    if ($dialogInstance) {
      if ($dialogInstance.element.find("form.add_notes_form").length > 0) {
        $wikiOuter.dialog({
          title: IssueNotesOnContextMenu.resources.label_add_note,
        });
      } else {
        $wikiOuter.dialog("option", "title", $wiki.data("title"));
      }
    }
  }

  function updateDialogButtons() {
    const currentPos = journalIds.indexOf(journalIdCurrent);
    const journalIdNext =
      currentPos < journalIds.length - 1 ? journalIds[currentPos + 1] : null;
    const journalIdPrev =
      currentPos - 1 >= 0 ? journalIds[currentPos - 1] : null;

    const $btnGroup = $wikiOuter
      .parent()
      .find(".ui-dialog-titlebar-button-group");

    const $btnDelete = $btnGroup.find(".btn-delete");
    $btnDelete.attr({
      href: `${homePath}journals/${journalIdCurrent}?journal%5Bnotes%5D=`,
    });

    const $btnEdit = $btnGroup.find(".btn-edit");
    $btnEdit.attr({
      href: `${homePath}journals/${journalIdCurrent}/edit`,
    });

    const $btnPrev = $btnGroup.find(".btn-prev");
    $btnPrev
      .attr({
        href: journalIdPrev
          ? `${homePath}issue_notes_on_context_menus/${journalIdPrev}`
          : "",
      })
      .button({
        disabled: journalIdPrev === null,
      });

    const $btnNext = $btnGroup.find(".btn-next");
    $btnNext
      .attr({
        href: journalIdNext
          ? `${homePath}issue_notes_on_context_menus/${journalIdNext}`
          : "",
      })
      .button({
        disabled: journalIdNext === null,
      });
  }

  function updateContextMenuNotesCount() {
    if ($("#context-menu").is(":visible")) {
      $("#context-menu li.issue_notes_on_context_menu > a").text(
        labelContextMenu
      );
    }
  }

  updateDialogClass();
  updateWikiId();
  updateDialogTitle();
  updateDialogButtons();
  updateContextMenuNotesCount();
}

updateIssueNotesOnContextMenuDialog.bindEventsToEditFormButtons = function (
  dialog
) {
  const $dialog = $(dialog);

  $dialog.addClass("edit_note");

  // Bind event to submit button
  const $submitButton = $dialog.find("form[id^=journal] input[type=submit]");
  $submitButton.on("click.show_dialog_buttons", () => {
    $dialog.removeClass("edit_note");
  });

  // Bind event to cancel button
  const $cancelButton = $dialog.find("form[id^=journal] input[type=submit]+a");

  const onClickFn = $cancelButton
    .attr("onclick")
    .replace(/return\s+false;?$/, "");
  $cancelButton.attr("onclick", "");

  $cancelButton.on("click.show_dialog_buttons", () => {
    $dialog.removeClass("edit_note");
    eval(onClickFn);
  });
};

document.addEventListener('DOMContentLoaded', () => {
  let dialogWidth = 500;
  let dialogHeight = 300;
  const resources = IssueNotesOnContextMenu.resources;

  /**
   * Check if target is notes context menu
   * @param {Element} target - Target element
   * @returns {boolean} True if target is notes context menu
   */
  function isIssueNotesOnContextMenu(target) {
    function isEditCancelButton(target) {
      return $(target).attr("href")
        ? $(target).attr("href")[0] === "#" &&
            $(target).text() === resources.label_cancel
        : false;
    }

    return (
      $(target).closest(".issue_notes_on_context_menu").length > 0 ||
      isEditCancelButton(target)
    );
  }

  /**
   * Close wiki dialog
   */
  function closeWiki() {
    if ($(".issue_notes_on_context_menu_wiki_outer").dialog("instance")) {
      $(".issue_notes_on_context_menu_wiki_outer").dialog("destroy");
      $("body").removeClass("issue_notes_on_context_menu_wiki_maximized");
    }
  }

  /**
   * Try closing wiki dialog
   * @param {Event} event - Click or contextmenu event
   */
  function tryCloseWiki(event) {
    if (isIssueNotesOnContextMenu(event.target)) return;
    closeWiki();
  }

  /**
   * Calculate best dialog position
   * @param {Element} target - Target element
   * @param {number} width - Dialog width
   * @param {number} height - Dialog height
   * @returns {[string, string]} CSS position strings
   */
  function calcBestDialogPosition(target, width, height) {
    const rect = target.getBoundingClientRect();
    const overFlowRight = window.innerWidth - rect.right < width;
    const overFlowBottom = window.innerHeight - rect.bottom < height;

    const posMy =
      (overFlowRight ? "right" : "left") +
      " " +
      (overFlowBottom ? "bottom" : "top");
    const posAt =
      (overFlowRight ? "left" : "right") +
      " " +
      (overFlowBottom ? "bottom" : "top");

    return [posMy, posAt];
  }

  /**
   * Create empty wiki dialog
   * @param {Element} target - Target element
   * @param {jQuery} wikiOuter - Outer element of wiki
   * @returns {Element} Dialog element
   */
  function createEmptyDialog(target, wikiOuter) {
    const homePath = $("#top-menu a.home").attr("href");
    const addable = $(wikiOuter).data("addable");
    const issueId = $(wikiOuter).data("issueId");
    const [posMy, posAt] = calcBestDialogPosition(
      target,
      dialogWidth,
      dialogHeight
    );

    return $(wikiOuter).dialog({
      width: dialogWidth,
      height: dialogHeight,
      position: { my: posMy, at: posAt, of: target },
      classes: {
        "ui-dialog":
          "issue_notes_on_context_menu" + (addable ? " addable" : ""),
      },
      title: resources.label_loading,
      appendTo: "#content",
      closeText: resources.label_close,
      create: function () {
        const $dialogContent = $(this);

        // Add buttons
        const $dialog = $dialogContent.parent();
        const $titleBar = $dialog.find(".ui-dialog-titlebar");

        const $btnDelete = $("<a>")
          .addClass("btn-delete")
          .addClass("ui-button ui-corner-all ui-widget ui-button-icon-only")
          .addClass("delete mui-icon")
          .attr({
            href: "",
            "data-remote": "true",
            "data-method": "put",
            title: resources.label_delete,
            "data-confirm": resources.text_are_you_sure,
          });

        const $btnEdit = $("<a>")
          .addClass("btn-edit")
          .addClass("ui-button ui-corner-all ui-widget ui-button-icon-only")
          .addClass("edit mui-icon")
          .attr({
            href: "",
            "data-remote": "true",
            "data-method": "get",
            title: resources.label_edit,
          });

        const $btnPrev = $("<a>")
          .addClass("btn-prev")
          .attr({
            href: "",
            "data-remote": "true",
            "data-method": "get",
          })
          .button({
            icon: "ui-icon-caret-1-w",
            label: resources.label_previous,
            showLabel: false,
            disabled: true,
          })
          .on("click", (e) => {
            setTimeout(() => {
              $(e.target).closest("a.btn-prev").button({ disabled: true });
              const $dialog = $(e.target).closest(".ui-dialog");
              $dialog.removeClass("editable");
            });
          });

        const $btnNext = $("<a>")
          .addClass("btn-next")
          .attr({
            href: "",
            "data-remote": "true",
            "data-method": "get",
          })
          .button({
            icon: "ui-icon-caret-1-e",
            label: resources.label_next,
            showLabel: false,
            disabled: true,
          })
          .on("click", (e) => {
            setTimeout(() => {
              $(e.target).closest("a.btn-next").button({ disabled: true });
              const $dialog = $(e.target).closest(".ui-dialog");
              $dialog.removeClass("editable");
            });
          });

        const $btnAdd = $("<a>")
          .addClass("btn-add")
          .attr({
            href: `${homePath}issue_notes_on_context_menus/${issueId}/new`,
            "data-remote": "true",
            "data-method": "get",
          })
          .button({
            icon: "ui-icon-plus",
            label: resources.label_add,
            showLabel: false,
          });

        const $btnMaximize = $("<button>")
          .addClass("ui-button ui-corner-all ui-widget ui-button-icon-only")
          .addClass("maximize mui-icon")
          .attr("title", resources.label_maximize)
          .on("click", (e) => {
            const $dialog = $(e.target).closest(
              ".ui-dialog.issue_notes_on_context_menu"
            );
            $dialog.addClass("maximized");
            $("body").addClass("issue_notes_on_context_menu_wiki_maximized");
          });

        const $btnRestore = $("<button>")
          .addClass("ui-button ui-corner-all ui-widget ui-button-icon-only")
          .addClass("restore mui-icon")
          .attr("title", resources.label_restore)
          .on("click", (e) => {
            const $dialog = $(e.target).closest(
              ".ui-dialog.issue_notes_on_context_menu"
            );
            $dialog.removeClass("maximized");
            $("body").removeClass("issue_notes_on_context_menu_wiki_maximized");
          });

        const $btnGroup = $("<div>").addClass(
          "ui-dialog-titlebar-button-group"
        );

        $btnGroup
          .append($btnDelete)
          .append($btnEdit)
          .append($btnPrev)
          .append($btnNext)
          .append($btnAdd)
          .append($btnMaximize)
          .append($btnRestore)
          .appendTo($titleBar);
      },
      resizeStop: (_, ui) => {
        dialogWidth = ui.size.width;
        dialogHeight = ui.size.height;
      },
      close: (e) => {
        // Destroy on close
        $(e.target).dialog("destroy");
      },
    });
  }

  /**
   * Open wiki dialog
   * @param {Event} event - Mouseover event
   */
  function openWikiDialog(event) {
    const homePath = $("#top-menu a.home").attr("href");
    const $wikiOuter = $(".issue_notes_on_context_menu_wiki_outer");
    const $wiki = $wikiOuter.children(".wiki");
    if ($wiki.length === 0) {
      console.warn("Target wiki is not found.");
      return;
    }

    const journalIdInit = $wikiOuter.data("journalIdInit");
    if (journalIdInit === undefined) return;

    if (journalIdInit === "") {
      if (event.type === "mouseenter") return;
    }

    const $dialogContent = createEmptyDialog(
      $("li.issue_notes_on_context_menu")[0],
      $wikiOuter
    );

    if (journalIdInit === "") {
      setTimeout(() => {
        const $dialog = $dialogContent.closest(".ui-dialog");
        const $btnAdd = $dialog.find("a.btn-add");
        $btnAdd[0].click();
        $dialogContent.dialog({ title: resources.label_add_note });
      });
    } else {
      if ($wiki.hasClass("empty")) {
        $.get(
          `${homePath}issue_notes_on_context_menus/${journalIdInit}.js`,
          () => {
            const $wiki = $wikiOuter.children(".wiki");
            if ($wiki.length === 0) return;

            $wiki.removeClass("empty");
          }
        );
      } else {
        updateIssueNotesOnContextMenuDialog($wikiOuter);
      }
    }
  }

  /**
   * Override original context menu and jsToolbar.draw functions
   */
  (function override() {
    try {
      const contextMenuClickOrg = contextMenuClick;
      contextMenuClick = function (event) {
        if (isIssueNotesOnContextMenu(event.target)) return;
        tryCloseWiki(event);
        contextMenuClickOrg(event);
      };

      const contextMenuRightClickOrg = contextMenuRightClick;
      contextMenuRightClick = function (event) {
        if (isIssueNotesOnContextMenu(event.target)) return;
        tryCloseWiki(event);
        contextMenuRightClickOrg(event);
      };

      const contextMenuCreateOrg = contextMenuCreate;
      contextMenuCreate = function () {
        contextMenuCreateOrg();
        /**
         * Add event listeners
         */
        (function addEvents() {
          $("#context-menu")
            .on(
              "mouseenter",
              "ul > li.issue_notes_on_context_menu",
              openWikiDialog
            )
            .on(
              "mouseenter",
              "ul > li:not(.issue_notes_on_context_menu)",
              tryCloseWiki
            )
            .on(
              "click",
              "ul > li.issue_notes_on_context_menu a.add_note",
              openWikiDialog
            );
        })();
      };

      // Override jsToolbar.draw
      const drawOrg = jsToolBar.prototype.draw;
      jsToolBar.prototype.draw = function (mode) {
        drawOrg.call(this, mode);

        const $dialog = $(this.toolbarBlock).closest(
          ".ui-dialog.issue_notes_on_context_menu"
        );
        if ($dialog.length === 0) return;
        if ($dialog.hasClass("add_note")) return;

        updateIssueNotesOnContextMenuDialog.bindEventsToEditFormButtons(
          $dialog
        );
      };
    } catch {
      console.error(
        "[Redmine Notes On Context Menu] " +
          "Failed to initialize the context-menu."
      );
      return;
    }
  })();
});
