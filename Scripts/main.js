let myBookshelf;
console.log(localStorage.length);
if (!localStorage.myBookshelf) {
	myBookshelf = [];
} else myBookshelf = JSON.parse(localStorage.getItem("myBookshelf"));
const MONTHS = [
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
];

const shelf = document.querySelector(".shelf");
const addBookButton = document.querySelector(".add-new-book");
const cancelButton = document.querySelector(".add-book-cancel-button");
const submitButton = document.querySelector(".add-book-submit-button");
const addBookModal = document.querySelector(".add-book-modal");
const bookInfo = document.querySelectorAll(
	`.add-book-modal input:not([type="checkbox"])`
);
const addBookCompletedCheck = document.querySelector(
	`.add-book-modal input[type="checkbox"]`
);

function Book(title, author, pages, completed) {
	this.title = title;
	this.author = author;
	this.pages = pages;
	this.dateAdded = getDate();
	this.completed = completed;

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
}

function checkAction(event) {
	event.stopPropagation();
	let itemTarget = event.target;
	if (itemTarget.classList.contains("delete-button")) {
		deleteBook(itemTarget.parentElement.parentElement);
	} else if (itemTarget.id === "completed") {
		readUnreadBook(itemTarget);
	}
}

function deleteBook(item) {
	myBookshelf = [
		...myBookshelf.slice(0, Number(item.dataset.index)),
		...myBookshelf.slice(Number(item.dataset.index) + 1),
	];
	localStorage.setItem("myBookshelf", JSON.stringify(myBookshelf));
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
	clearShelf();
	displayBooks();
}

function displayBooks() {
	if (myBookshelf.length) {
		myBookshelf.forEach((item) => {
			const node = document.createElement("div");
			node.innerHTML = `
    <div class="book-title">
      <h2>${item.title}</h2>
		</div>
    <p><b>Author</b>: ${item.author}</p>
    <p><b>Pages</b>: ${item.pages}</p>
    <p><b>Date Added</b>: ${item.dateAdded}</p>
    <p><b>Date Completed</b>: ${
			item.dateCompleted ? item.dateCompleted : "N/A"
		}</p>
    <div class="book-actions">
      <label
        >Completed:
        <input type="checkbox" name="completed" id="completed" ${
					item.completed ? "checked" : null
				}/>
        <div class="slider-switch"></div>
      </label>
      <div class="delete-button button">Delete</div>
		</div>`;
			node.classList.add("book");
			node.classList.add("book-card");
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
		else return;
	});
	if (args.length === 3) {
		new Book(...args, addBookCompletedCheck.checked);
		closeModal();
		clearShelf();
		displayBooks();
	}
});
