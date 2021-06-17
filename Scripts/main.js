let myBookshelf = [];
let username;

let gradient = `linear-gradient(to bottom, var(--color-accent-off),
var(--color-accent));`;
const domElements = (function () {
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
	return {
		shelf,
		addBookButton,
		cancelButton,
		submitButton,
		addBookModal,
		usernameModal,
		usernameInput,
		cancelNameButton,
		submitNameButton,
		bookInfo,
		addBookCompletedCheck,
		userNameOnTitle,
		shelfInfo,
	};
})();

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
class Book {
	constructor(title, author, pages, url, completed) {
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
		renderShelf();
	}
}

if (!localStorage.myBookshelf) {
	myBookshelf = [];
	new Book(
		"Kafka on the Shore",
		"Hakura Murakami",
		505,
		"https://images-na.ssl-images-amazon.com/images/I/81tdbrewW0L.jpg",
		true
	);
} else myBookshelf = JSON.parse(localStorage.getItem("myBookshelf"));

if (!localStorage.username) {
	domElements.usernameModal.classList.remove("display-none");
} else {
	username = localStorage.getItem("username");
	domElements.userNameOnTitle.textContent = `${username}'${
		username[username.length - 1].toLowerCase() === "s" ? "" : "s"
	} Bookshelf`;
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
	item.remove();
	updateShelfInfo();
	if (!myBookshelf.length) {
		const node = document.createElement("p");
		node.classList.add("hint");
		node.textContent = `Your shelf is empty, press + to add books.`;
		domElements.shelf.append(node);
	}
}

function clearShelf() {
	const temp = document.querySelectorAll(".shelf *:not(.add-new-book)");
	temp.forEach((item) => {
		item.remove();
	});
}

function readUnreadBook(item) {
	let itemCard = item.parentElement.parentElement.parentElement;
	myBookshelf[Number(itemCard.dataset.index)].completed = item.checked;
	if (!item.checked) {
		myBookshelf[Number(itemCard.dataset.index)].dateCompleted = null;
		itemCard.classList.remove("read");
	} else {
		myBookshelf[Number(itemCard.dataset.index)].dateCompleted = getDate();
		itemCard.classList.add("read");
	}
	itemCard.querySelector(`p:last-child`).innerHTML = `<b>Finished On</b>: ${
		myBookshelf[Number(itemCard.dataset.index)].dateCompleted || `N/A`
	}`;

	localStorage.setItem("myBookshelf", JSON.stringify(myBookshelf));

	updateShelfInfo();
}

function updateShelfInfo() {
	domElements.shelfInfo[0].textContent = myBookshelf.length;
	domElements.shelfInfo[1].textContent = myBookshelf.reduce((sum, element) => {
		if (element.completed) sum++;
		return sum;
	}, 0);
	domElements.shelfInfo[2].textContent =
		myBookshelf.length - Number(domElements.shelfInfo[1].textContent);
}

function renderShelf() {
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
				Mark read:
        <input type="checkbox" id="completed-check" name="completed" id="completed" ${
					item.completed ? "checked" : null
				}/>
        <div class="slider-switch"></div>
      </label>
      <div title="Delete" class="danger-button button"><i class="far fa-trash-alt"></i></div>
		</div>
		${
			item.imgURL
				? `<div class="cover-image" style="--background: url(${item.imgURL});"></div>`
				: `<div class="cover-image" style="--background: ${gradient};"><h2>${item.title}</h2><p>${item.author}</p></div>`
		}`;
			node.classList.add("book", "book-card");
			if (item.completed) node.classList.add("read");
			node.dataset.index = myBookshelf.indexOf(item);
			// shelf.insertBefore(node, addBookButton);
			domElements.shelf.append(node);
		});
	} else {
		const node = document.createElement("p");
		node.classList.add("hint");
		node.textContent = `Your shelf is empty, press + to add books.`;
		domElements.shelf.append(node);
	}
}

function closeModal() {
	domElements.addBookModal.classList.add("display-none");
	document.body.classList.remove("overflow-none");
	domElements.bookInfo.forEach((item) => {
		item.value = "";
	});
	domElements.addBookCompletedCheck.checked = false;
}

clearShelf();
renderShelf();

domElements.shelf.addEventListener("click", checkAction);

domElements.cancelButton.addEventListener("click", closeModal);

domElements.addBookButton.addEventListener("click", () => {
	domElements.addBookModal.classList.remove("display-none");
	document.body.classList.add("overflow-none");
});

domElements.submitButton.addEventListener("click", (event) => {
	event.preventDefault();
	let args = [];
	domElements.bookInfo.forEach((item) => {
		if (item.value) args.push(item.value);
		else {
			if (item.name === "url") args.push("");
			return;
		}
	});
	if (args.length === 4) {
		new Book(...args, domElements.addBookCompletedCheck.checked);
		closeModal();
		clearShelf();
		renderShelf();
	}
});

domElements.cancelNameButton.addEventListener("click", () => {
	domElements.usernameInput.value = "";
	domElements.usernameModal.classList.add("display-none");
});

domElements.submitNameButton.addEventListener("click", (event) => {
	event.preventDefault();
	if (domElements.usernameInput.value) {
		username = domElements.usernameInput.value;
		localStorage.setItem("username", username);
		domElements.usernameModal.classList.add("display-none");
		domElements.userNameOnTitle.textContent = `${username}'${
			username[username.length - 1].toLowerCase() === "s" ? "" : "s"
		} Bookshelf`;
	}
});

domElements.userNameOnTitle.addEventListener("click", () => {
	domElements.usernameModal.classList.remove("display-none");
});

updateShelfInfo();
