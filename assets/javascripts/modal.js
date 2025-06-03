document.addEventListener("DOMContentLoaded", function () {
  // Handler cho Agile board
  const globalModalElementId = "global-modal"
  const modal = document.getElementById(globalModalElementId);
  const modalTitle = modal.querySelector(".header__title")
  const modalBody = modal.querySelector(".content__body");

  const closeButton = modal.querySelector('.header__close-btn');

  let afterSubmit = null;
  let isCloseModalAfterSubmit = true

  function closeModal() {
    modal.style.display = "none";
  }

  function closeModalWithReload() {
    closeModal()
    location.reload()
  }

  function openModal(title, content) {
    modalTitle.innerHTML = title

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;

    // Xoá các phần tử không mong muốn trước khi đưa vào DOM chính
    tempDiv.querySelector('#top-menu')?.remove();
    tempDiv.querySelector('#header')?.remove();
    tempDiv.querySelectorAll('#history ul li a').forEach(item => {
      item.href = ""
    })
    const historyContent = tempDiv.querySelector("#tab-content-history")
    if (historyContent) {
      historyContent.style.display = "block"
    }

    // Sau khi lọc xong, gán vào modal container
    modalBody.innerHTML = tempDiv.innerHTML;

    modal.style.display = "flex";

    modalBody.querySelectorAll('input[type=submit][data-disable-with]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        console.log('e', e.target.dataset.disableWith)
        if (["Create and add another", "Submit"].includes(e.target.dataset.disableWith)) {
          // Create and add another or Submit Edit
          isCloseModalAfterSubmit = false
        } else {
          isCloseModalAfterSubmit = true
        }
      });
    });
  }

  function setErrorModal() {
    modalBody.innerHTML = "Có lỗi xảy ra"
  }

  closeButton.addEventListener('click', function () {
    // Nếu isCloseModalAfterSubmit=true => đã reload rồi
    if (isCloseModalAfterSubmit) {
      closeModal()
    } else {
      closeModalWithReload()
    }
  });

  document.body.addEventListener("click", function (e) {
    // reset
    const isAgileBoardEditIssueBtn = e.target.closest(".edit-issue-link");
    const isAgileBoardCreateIssueBtn = e.target.closest("#new-agile-issue-btn");
    const isAgileBoardViewIssueByName = e.target.closest('p.name a')

    const isListIssuesEditBtn = e.target.closest("#context-menu a.icon-edit");
    const isListIssuesCreateBtn = e.target.closest("a.icon-add.new-issue")

    if (isListIssuesCreateBtn && isListIssuesCreateBtn.getAttribute("href")?.includes("/projects")) {
      e.preventDefault();

      const href = isListIssuesCreateBtn.getAttribute("href");
      afterSubmit = () => {
        handleCreateIssueModal(href)
      }

      handleCreateIssueModal(href);
      return;
    }

    // Nếu là nút "Edit" từ context menu trong danh sách issue
    if (isListIssuesEditBtn && isListIssuesEditBtn.getAttribute("href")?.includes("/issues")) {
      e.preventDefault();

      const href = isListIssuesEditBtn.getAttribute("href"); // /issues/123/edit
      afterSubmit = null;

      handleEditIssueModal(href);
      return;
    }

    if (isAgileBoardViewIssueByName) {
      e.preventDefault();

      const href = isAgileBoardViewIssueByName.getAttribute('href')
      afterSubmit = () => {
        handleViewIssueModal(href)
      }

      handleViewIssueModal(href)
      return;
    }

    if (isAgileBoardCreateIssueBtn) {
      e.preventDefault();

      const projectId = window.location.pathname.split('/')[2];
      const href = `/projects/${projectId}/issues/new`
      afterSubmit = () => {
        handleCreateIssueModal(href)
      }

      handleCreateIssueModal(href)
      return;
    }
    // Nếu là từ Agile board
    if (isAgileBoardEditIssueBtn) {
      e.preventDefault();

      const issueId = isAgileBoardEditIssueBtn.dataset.issueId;
      afterSubmit = afterSubmit = () => {
        handleViewIssueModal(`/issues/${issueId}`)
      }

      handleEditIssueModal(`/issues/${issueId}/edit`);
      return;
    }
  });

  function handleViewIssueModal(href) {
    fetch(href)
      .then((res) => res.text())
      .then((html) => {
        openModal("View Issue", html)
      });
  }

  function handleCreateIssueModal(href) {
    fetch(href)
      .then((res) => res.text())
      .then((html) => {
        openModal("Create Issue", html)
      });
  }

  function handleEditIssueModal(editUrl) {
    fetch(editUrl, {
      headers: { "X-Requested-With": "XMLHttpRequest" }
    })
      .then(response => response.text())
      .then(html => {
        openModal("Edit Issue", html)
      });
  }

  document.addEventListener("submit", function (e) {
    const modal = e.target.closest(`#${globalModalElementId}`);
    if (modal) {
      e.preventDefault();

      const form = e.target;
      fetch(form.action, {
        method: form.method,
        body: new FormData(form),
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      }).then(response => {
        if (response.ok) {
          if (isCloseModalAfterSubmit || !afterSubmit) {
            closeModalWithReload()
          } else {
            afterSubmit()
          }
        } else {
          throw new Error("response status not ok")
        }
      }).catch(error => {
        console.error(error);
        setErrorModal();
      });
    }
  });

});

