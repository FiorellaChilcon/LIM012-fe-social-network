import {
  deleteDocumentIdFromUserCollection, updateDocument, addDocumentIdToUserCollection,
  addComment, getDocument,
} from '../firebase/firestore.js';
import { getFileFromStorage } from '../firebase/storage.js';
import { renderMenu } from './menu-publicacion.js';

export const renderPost = (userId, doc, element) => {
  const div = document.createElement('div');
  div.id = doc.id;
  div.className = 'actual-home-post';
  const post = doc.data();
  const getDate = date => `${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ${date.toLocaleDateString()} `;
  const date = post.timestamp !== null ? getDate(post.timestamp.toDate()) : getDate(new Date());
  const template = `
<div class="header-post">
  <img src="images/profile-cube.png" alt="profile photo" class="user-photo-post pic-style right-size">
  <div class="date-username">
    <p class="post-userName"></p>
    <p class="text">${date} <i></i></p>
  </div>
</div>
<div class="main-post">
  <p></p>
</div>
<div class="footer-post">
  <i class="far fa-heart"></i><span class="like-counter">${post.likes}</span>
  <i class="far fa-comments"></i><span class="comments-counter"></span>
  <form class="comment-form">
      <img src="images/profile-cube.png" alt="profile photo" class="actual-user-photo pic-style comment-size">
      <input class="comment-text" type="text" placeholder="Add a comment..." required>
      <button><i class="fa fa-paper-plane"></i></button>
  </form>
  <div class="comment-container" id="comment-container-${doc.id}"></div>
</div>`;
  div.innerHTML = template;
  // VISIBILITY ICON
  const visibilityIcon = div.querySelector('.text i');
  if (post.visibility === 'public') {
    visibilityIcon.className = 'fas fa-globe-americas';
  }
  const postUserName = div.querySelector('.post-userName');
  const headerPost = div.querySelector('.header-post');
  const dateContainer = div.querySelector('.text');
  const likeIcon = div.querySelector('.fa-heart');
  // DISPLAY POST CONTENT
  const postContent = div.querySelector('.main-post p');
  postContent.textContent = post.content;
  // DISPALY NAME AND PHOTO URL
  getDocument('users', post.userId, (userDoc) => {
    postUserName.textContent = userDoc.data().userName;
    if (userDoc.data().userPhoto) {
      const photoPost = div.querySelector('.user-photo-post');
      photoPost.src = userDoc.data().userPhoto;
    }
  });
  // PHOTO POST
  const mainPost = div.querySelector('.main-post');
  if (post.photo !== '') {
    const img = document.createElement('img');
    img.className = 'photo-post';
    img.alt = 'photo';
    getFileFromStorage(post.photo).then((url) => {
      img.src = url;
    });
    mainPost.appendChild(img);
  }
  if (userId === post.userId) {
    // VISIBILITY CHANGE OPTIONS
    const visibilitySelect = document.createElement('select');
    const publicOption = document.createElement('option');
    const privateOption = document.createElement('option');
    publicOption.innerHTML = 'public';
    privateOption.innerHTML = 'private';
    if (post.visibility === 'private') {
      visibilitySelect.appendChild(privateOption);
      visibilitySelect.appendChild(publicOption);
    } else {
      visibilitySelect.appendChild(publicOption);
      visibilitySelect.appendChild(privateOption);
    }
    dateContainer.replaceChild(visibilitySelect, visibilityIcon);
    visibilitySelect.addEventListener('change', (event) => {
      updateDocument('posts', doc.id, 'visibility', event.target.value);
    });

    // DISPLAY MENU
    const postText = div.querySelector('.main-post p');
    headerPost.appendChild(renderMenu('posts', 'myPosts', userId, doc, postText));
  }
  // COMMENT FORM PHOTO
  const actualUserPhoto = div.querySelector('.actual-user-photo');
  getDocument('users', userId, (currentUserDoc) => {
    if (currentUserDoc.data().userPhoto) {
      actualUserPhoto.src = currentUserDoc.data().userPhoto;
    }
    // PAINT USER LIKES
    if (currentUserDoc.data().myLikes.some(likedPostId => likedPostId === doc.id)) {
      likeIcon.classList.add('red');
    }
  });
  // likes
  let likeCounter = post.likes;
  likeIcon.addEventListener('click', () => {
    likeIcon.classList.toggle('red');
    if (likeIcon.classList.contains('red')) {
      likeCounter += 1;
      addDocumentIdToUserCollection(userId, doc.id, 'myLikes');
    } else {
      likeCounter -= 1;
      deleteDocumentIdFromUserCollection(userId, doc.id, 'myLikes');
    }
    updateDocument('posts', doc.id, 'likes', likeCounter);
  });
  // SHOW COMMENT FORM
  const commentIcon = div.querySelector('.fa-comments');
  const commentForm = div.querySelector('.comment-form');
  const commentContainer = div.querySelector('.comment-container');
  commentIcon.addEventListener('click', () => {
    commentForm.classList.toggle('display-flex');
    commentContainer.classList.toggle('display-flex');
  });
  // SEND COMMENT
  commentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const commentText = commentForm.querySelector('.comment-text');
    addComment(userId, doc.id, commentText.value).then((comment) => {
      addDocumentIdToUserCollection(userId, comment.id, 'myComments');
      commentForm.reset();
    });
  });
  element.insertBefore(div, element.firstChild);
  return div;
};
