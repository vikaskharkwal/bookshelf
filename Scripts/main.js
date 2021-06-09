let myBookshelf;
let username;
let colorTheme;
if (!localStorage.myBookshelf) {
	myBookshelf = [];
} else myBookshelf = JSON.parse(localStorage.getItem("myBookshelf"));

const MONTHS = Object.freeze([
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
]);

const shelf = document.querySelector(".shelf");
const addBookButton = document.querySelector(".add-new-book");
const cancelButton = document.querySelector(".add-book-cancel-button");
const submitButton = document.querySelector(".add-book-submit-button");
const addBookModal = document.querySelector(".add-book-modal");
const usernameModal = document.querySelector(".enter-name-modal");
const usernameInput = document.querySelector("#username");
const cancelNameButton = document.querySelector(".enter-name-cancel-button");
const submitNameButton = document.querySelector(".enter-name-submit-button");
const bookInfo = document.querySelectorAll(
	`.add-book-modal input:not([type="checkbox"])`
);
const addBookCompletedCheck = document.querySelector(
	`.add-book-modal input[type="checkbox"]`
);
const userNameOnTitle = document.querySelector(`header h2`);

const shelfInfo = document.querySelectorAll(".shelf-info span");
const darkmodeToggle = document.querySelector(".toggle-darkmode");

if (!localStorage.username) {
	usernameModal.classList.remove("display-none");
} else {
	username = localStorage.getItem("username");
	userNameOnTitle.textContent = `${username}'${
		username[username.length - 1].toLowerCase() === "s" ? "" : "s"
	} Bookshelf`;
}

if (!localStorage.colorTheme) {
	colorTheme = "light";
	localStorage.setItem("colorTheme", "light");
} else colorTheme = localStorage.getItem("colorTheme");

if (colorTheme === "dark") {
	document.documentElement.classList.add("dark");
	darkmodeToggle.checked = true;
}

darkmodeToggle.addEventListener("click", () => {
	if (darkmodeToggle.checked) {
		document.documentElement.classList.add("dark");
		localStorage.setItem("colorTheme", "dark");
	} else {
		document.documentElement.classList.remove("dark");
		localStorage.setItem("colorTheme", "light");
	}
});

function Book(title, author, pages, url, completed) {
	this.title = title;
	this.author = author;
	this.pages = pages;
	this.dateAdded = getDate();
	this.completed = completed;
	this.imgURL = url;

	if (this.completed) {
		this.dateCompleted = getDate();
	}

	addToBookshelf(this);
}

function getDate() {
	return `${MONTHS[new Date().getUTCMonth()]} 
  ${new Date().getUTCDate()}, 
  ${new Date().getUTCFullYear()}`;
}

function addToBookshelf(bookObj) {
	myBookshelf.unshift(bookObj);
	localStorage.setItem("myBookshelf", JSON.stringify(myBookshelf));
	updateShelfInfo();
}

function checkAction(event) {
	event.stopPropagation();
	let itemTarget = event.target;
	if (itemTarget.title === "Delete") {
		deleteBook(itemTarget.parentElement.parentElement);
	} else if (itemTarget.name === "completed") {
		readUnreadBook(itemTarget);
	}
}

function deleteBook(item) {
	myBookshelf = [
		...myBookshelf.slice(0, Number(item.dataset.index)),
		...myBookshelf.slice(Number(item.dataset.index) + 1),
	];
	localStorage.setItem("myBookshelf", JSON.stringify(myBookshelf));
	updateShelfInfo();
	clearShelf();
	displayBooks();
}

function clearShelf() {
	const temp = document.querySelectorAll(".shelf *:not(.add-new-book)");
	temp.forEach((item) => {
		item.remove();
	});
}

function readUnreadBook(item) {
	let itemLineage = item.parentElement.parentElement.parentElement;
	myBookshelf[Number(itemLineage.dataset.index)].completed = item.checked;
	if (!item.checked) {
		myBookshelf[Number(itemLineage.dataset.index)].dateCompleted = null;
	} else
		myBookshelf[Number(itemLineage.dataset.index)].dateCompleted = getDate();
	localStorage.setItem("myBookshelf", JSON.stringify(myBookshelf));
	updateShelfInfo();
	clearShelf();
	displayBooks();
}

function updateShelfInfo() {
	shelfInfo[0].textContent = myBookshelf.length;
	shelfInfo[1].textContent = myBookshelf.reduce((sum, element) => {
		if (element.completed) sum++;
		return sum;
	}, 0);
	shelfInfo[2].textContent =
		myBookshelf.length - Number(shelfInfo[1].textContent);
}

function displayBooks() {
	if (myBookshelf.length) {
		myBookshelf.forEach((item) => {
			const node = document.createElement("div");
			node.innerHTML = `
    <div class="text-content">
			<div class="book-title">
				<h2>${item.title}</h2>
			</div>
			<p><b>Author</b>: ${item.author}</p>
			<p><b>Pages</b>: ${item.pages}</p>
			<p><b>Added On</b>: ${item.dateAdded}</p>
			<p><b>Finished On</b>: ${item.dateCompleted ? item.dateCompleted : "N/A"}</p>
    </div>
    <div class="book-actions">
      <label title="Mark as read">
				Mark as read:
        <input type="checkbox" id="completed-check" name="completed" id="completed" ${
					item.completed ? "checked" : null
				}/>
        <div class="slider-switch"></div>
      </label>
      <div title="Delete" class="danger-button button"><i class="far fa-trash-alt"></i></div>
		</div>
		<div class="cover-image" style="--background: url(${item.imgURL});"></div>`;
			node.classList.add("book", "book-card");
			if (item.completed) node.classList.add("read");
			node.dataset.index = myBookshelf.indexOf(item);
			// shelf.insertBefore(node, addBookButton);
			shelf.append(node);
		});
	} else {
		const node = document.createElement("p");
		node.classList.add("hint");
		node.textContent = `Your shelf is empty, press + to add books.`;
		shelf.append(node);
	}
}

function closeModal() {
	addBookModal.classList.add("display-none");
	document.body.classList.remove("overflow-none");
	bookInfo.forEach((item) => {
		item.value = "";
	});
	addBookCompletedCheck.checked = false;
}

clearShelf();
displayBooks();

shelf.addEventListener("click", checkAction);

cancelButton.addEventListener("click", closeModal);

addBookButton.addEventListener("click", () => {
	addBookModal.classList.remove("display-none");
	document.body.classList.add("overflow-none");
});

submitButton.addEventListener("click", (event) => {
	event.preventDefault();
	let args = [];
	bookInfo.forEach((item) => {
		if (item.value) args.push(item.value);
		else {
			if (item.name === "url") args.push("https://i.ibb.co/mXWLT3w/image.png");
			return;
		}
	});
	if (args.length === 4) {
		new Book(...args, addBookCompletedCheck.checked);
		closeModal();
		clearShelf();
		displayBooks();
	}
});

cancelNameButton.addEventListener("click", () => {
	usernameInput.value = "";
	usernameModal.classList.add("display-none");
});

submitNameButton.addEventListener("click", (event) => {
	event.preventDefault();
	if (usernameInput.value) {
		username = usernameInput.value;
		localStorage.setItem("username", username);
		usernameModal.classList.add("display-none");
		userNameOnTitle.textContent = `${username}'${
			username[username.length - 1].toLowerCase() === "s" ? "" : "s"
		} Bookshelf`;
	}
});

userNameOnTitle.addEventListener("click", () => {
	usernameModal.classList.remove("display-none");
});

updateShelfInfo();
