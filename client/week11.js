import Auth from "./auth.js";
import { Errors, makeRequest } from "./authHelpers.js";

const myErrors = new Errors("errors");
const authenticator = new Auth(myErrors);

const loginForm = document.querySelector("#login");
loginForm.querySelector("#submitBtn").addEventListener("click", (e) => {
  e.preventDefault();
  authenticator.login(getPosts);
});

async function getPosts() {
  try {
    const data = await makeRequest("posts", "GET", null, authenticator.token);
    // make sure the element is shown
    document.querySelector("#content").classList.remove("hidden");
    let ul = document.querySelector("#list");
    ul.replaceChildren();
    for (let i = 0; i < data.length; i++) {
      if (i === 10) break;
      let li = document.createElement("li");
      let li_ul = document.createElement("ul");
      li_ul.insertAdjacentHTML("beforeend", data[i].content);
      li.insertAdjacentHTML("beforeend", data[i].title);
      li.appendChild(li_ul);
      ul.appendChild(li);
    }
    myErrors.clearError();
  } catch (error) {
    // if there are any errors, display them
    myErrors.handleError(error);
  }
}

document.querySelector("#createSubmit").addEventListener("click", (e) => {
  e.preventDefault();
  createPost();
});

async function createPost() {
  const form = document.forms.postForm;

  if (form.title.validity.valid && form.content.validity.valid) {
    myErrors.clearError();
    const data = {
      title: form.title.value,
      content: form.content.value.slice(0, 10).trim(),
    };
    try {
      const res = await makeRequest("posts", "POST", data, authenticator.token);
      form.title.value = "";
      form.content.value = "";
      getPosts();
    } catch (error) {
      myErrors.handleError(error);
    }
  } else {
    if (!form.title.validity.valid && !form.content.validity.valid) {
      myErrors.displayError({ message: "Title and Content are required." });
    } else if (!form.title.validity.valid && form.content.valid) {
      myErrors.displayError({ message: "Title is required." });
    } else {
      myErrors.displayError({ message: "Content is required." });
    }
  }
}
