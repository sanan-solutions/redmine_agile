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
    location.reload();
  }

  function openModal(title, content) {
    modalTitle.innerHTML = title

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;

    // Xoá các phần tử không mong muốn trước khi đưa vào DOM chính
    tempDiv.querySelector('#top-menu')?.remove();
    tempDiv.querySelector('#header')?.remove();

    // Sau khi lọc xong, gán vào modal container
    modalBody.innerHTML = tempDiv.innerHTML;

    modal.style.display = "flex";

    console.log("a", modalBody.querySelectorAll('input[type=submit][data-disable-with]'))
    modalBody.querySelectorAll('input[type=submit][data-disable-with]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        console.log('e', e.target.dataset.disableWith)
        if (e.target.dataset.disableWith === "Create and add another") {
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
    console.log('clcik')
    // reset
    const isAgileBoardEditIssueBtn = e.target.closest(".edit-issue-link");
    const isAgileBoardCreateIssueBtn = e.target.closest("#new-agile-issue-btn");

    const isListIssuesEditBtn = e.target.closest("a.icon-edit");
    const isListIssuesCreateBtn = e.target.closest("a.icon-add.new-issue")


    if (isListIssuesCreateBtn && isListIssuesCreateBtn.getAttribute("href")?.includes("/projects")) {
      e.preventDefault();
      afterSubmit = () => {
        const href = isListIssuesCreateBtn.getAttribute("href");
        handleCreateIssueModal(href)
      }

      const href = isListIssuesCreateBtn.getAttribute("href");
      handleCreateIssueModal(href);
      return;
    }

    // Nếu là nút "Edit" từ context menu trong danh sách issue
    if (isListIssuesEditBtn && isListIssuesEditBtn.getAttribute("href")?.includes("/issues")) {
      e.preventDefault();
      afterSubmit = null;

      console.log("click ne")
      const href = isListIssuesEditBtn.getAttribute("href"); // /issues/123/edit
      handleEditIssueModal(href);
      return;
    }

    if (isAgileBoardCreateIssueBtn) {
      e.preventDefault();
      afterSubmit = () => {
        handleCreateIssueModal(`/projects/${projectId}/issues/new`)
      }

      const projectId = window.location.pathname.split('/')[2];
      handleCreateIssueModal(`/projects/${projectId}/issues/new`)
      return;
    }
    // Nếu là từ Agile board
    if (isAgileBoardEditIssueBtn) {
      e.preventDefault();
      afterSubmit = null

      const issueId = isAgileBoardEditIssueBtn.dataset.issueId;
      handleEditIssueModal(`/issues/${issueId}/edit`);
      return;
    }
  });


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
        console.log("res", response)
        if (response.ok) {
          if (isCloseModalAfterSubmit) {
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

