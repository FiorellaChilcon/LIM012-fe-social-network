/* eslint-disable no-param-reassign */
import { deleteDocument, deleteDocumentIdFromUserCollection, updateDocument } from '../firebase/firestore.js';

export const renderMenu = (collection, userField, userId, doc, contentToEdit) => {
  const post = doc.data();
  // MENU OPTIONS
  const menuContainer = document.createElement('div');
  menuContainer.className = 'menu-container';
  const menuIcon = document.createElement('i');
  menuIcon.className = 'fas fa-ellipsis-h';
  const menu = document.createElement('div');
  menu.className = 'post-menu';
  menu.classList.add('style-menu');
  const editButton = document.createElement('button');
  editButton.textContent = 'Edit';
  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  menu.appendChild(editButton);
  menu.appendChild(deleteButton);
  menuContainer.appendChild(menu);
  menuContainer.appendChild(menuIcon);
  menuIcon.addEventListener('click', () => {
    menu.classList.toggle('display-flex');
  });
  // DELETE POST
  deleteButton.addEventListener('click', () => {
    deleteDocument(collection, doc.id);
    deleteDocumentIdFromUserCollection(userId, doc.id, userField);
  });
  // EDIT POST
  const checkIcon = document.createElement('i');
  checkIcon.className = 'fas fa-check';
  const cancelIcon = document.createElement('i');
  cancelIcon.className = 'fas fa-times';
  let contentValue = post.content;
  editButton.addEventListener('click', () => {
    contentToEdit.contentEditable = true;
    contentToEdit.focus();
    menu.classList.remove('display-flex');
    menuContainer.innerHTML = '';
    menuContainer.appendChild(checkIcon);
    menuContainer.appendChild(cancelIcon);
  });
  // save changes
  checkIcon.addEventListener('click', () => {
    updateDocument(collection, doc.id, 'content', contentToEdit.innerText);
    contentValue = contentToEdit.innerText;
    contentToEdit.contentEditable = false;
    menuContainer.innerHTML = '';
    menuContainer.appendChild(menu);
    menuContainer.appendChild(menuIcon);
  });
  // cancel changes
  cancelIcon.addEventListener('click', () => {
    contentToEdit.contentEditable = false;
    contentToEdit.textContent = contentValue;
    menuContainer.innerHTML = '';
    menuContainer.appendChild(menu);
    menuContainer.appendChild(menuIcon);
  });
  return menuContainer;
};
